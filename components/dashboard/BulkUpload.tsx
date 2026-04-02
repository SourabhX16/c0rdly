'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { bulkInsertStudents } from '@/actions/students';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import type { StudentFormData } from '@/types/database';

interface Props {
  schoolId: string;
}

export default function BulkUploadPage({ schoolId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<StudentFormData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  const downloadTemplate = () => {
    const headers = ['name', 'scholar_no', 'roll_no', 'dob', 'class', 'medium', 'father_name', 'mother_name', 'sssm_id', 'family_id', 'aadhar_no', 'section'];
    const sample = ['Rahul Kumar', 'SCH001', '1', '2012-05-15', '5', 'Hindi', 'Ramesh Kumar', 'Sunita Devi', '', '', '', 'A'];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'c0rdly_student_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setErrors([]);
    setSuccess(false);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errs: string[] = [];
        const students: StudentFormData[] = [];

        (results.data as Record<string, string>[]).forEach((row, idx) => {
          const lineNum = idx + 2;
          if (!row.name?.trim()) { errs.push(`Row ${lineNum}: Missing name`); return; }
          if (!row.scholar_no?.trim()) { errs.push(`Row ${lineNum}: Missing scholar_no`); return; }
          if (!row.dob?.trim()) { errs.push(`Row ${lineNum}: Missing dob`); return; }
          if (!row.class?.trim()) { errs.push(`Row ${lineNum}: Missing class`); return; }
          if (!row.father_name?.trim()) { errs.push(`Row ${lineNum}: Missing father_name`); return; }
          if (!row.mother_name?.trim()) { errs.push(`Row ${lineNum}: Missing mother_name`); return; }

          // Edge case: name too long (max 100 chars)
          if (row.name.trim().length > 100) { errs.push(`Row ${lineNum}: Name too long (max 100 chars)`); return; }

          // Edge case: validate date format (basic check)
          const dateVal = new Date(row.dob.trim());
          if (isNaN(dateVal.getTime())) { errs.push(`Row ${lineNum}: Invalid date format for dob "${row.dob.trim()}"`); return; }

          // Edge case: class must be 1-12
          const classNum = parseInt(row.class.trim(), 10);
          if (isNaN(classNum) || classNum < 1 || classNum > 12) { errs.push(`Row ${lineNum}: Class must be between 1 and 12`); return; }

          students.push({
            name: row.name.trim(),
            scholar_no: row.scholar_no.trim(),
            roll_no: row.roll_no?.trim() || '',
            dob: row.dob.trim(),
            class: String(classNum),
            section: row.section?.trim(),
            medium: row.medium?.trim() || 'Hindi',
            father_name: row.father_name.trim(),
            mother_name: row.mother_name.trim(),
            sssm_id: row.sssm_id?.trim(),
            family_id: row.family_id?.trim(),
            aadhar_no: row.aadhar_no?.trim(),
          });
        });

        // Edge case: check for duplicate scholar numbers within file
        const scholarNos = students.map((s) => s.scholar_no);
        const duplicates = scholarNos.filter((sn, i) => scholarNos.indexOf(sn) !== i);
        if (duplicates.length > 0) {
          const unique = [...new Set(duplicates)];
          unique.forEach((dup) => errs.push(`Duplicate scholar_no found: "${dup}"`));
        }

        setParsed(students);
        setErrors(errs);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (parsed.length === 0) return;
    setUploading(true);
    try {
      await bulkInsertStudents(schoolId, parsed);
      setSuccess(true);
      setTimeout(() => { router.push('/dashboard/students'); router.refresh(); }, 1500);
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : 'Upload failed']);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Template */}
      <div className="flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">CSV Template</h2>
          <p className="mt-1 text-sm text-surface-500">Download the template, fill it with student data, and upload below.</p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700">
          <Download className="h-4 w-4" /> Download Template
        </button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
          dragOver ? 'border-primary-500 bg-primary-50/50' : 'border-surface-300 bg-white'
        }`}>
        <Upload className={`h-10 w-10 ${dragOver ? 'text-primary-500' : 'text-surface-400'}`} />
        <p className="mt-3 text-sm font-medium text-surface-700">
          Drag & drop your CSV here, or{' '}
          <label className="cursor-pointer text-primary-600 hover:text-primary-700">
            browse
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        </p>
        <p className="mt-1 text-xs text-surface-400">Only .csv files are accepted</p>
      </div>

      {/* Parsed results */}
      {file && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-surface-900">{file.name}</p>
                <p className="text-xs text-surface-500">{parsed.length} valid records{errors.length > 0 ? ` · ${errors.length} errors` : ''}</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setParsed([]); setErrors([]); }}
              className="rounded-lg p-1 text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 max-h-32 overflow-y-auto rounded-lg bg-danger-500/10 p-3 text-sm text-danger-600">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 py-0.5">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {e}
                </div>
              ))}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-100 p-3 text-sm font-medium text-accent-700">
              <CheckCircle className="h-4 w-4" /> Students uploaded successfully! Redirecting...
            </div>
          )}

          {parsed.length > 0 && !success && (
            <div className="mt-4">
              <div className="mb-3 max-h-48 overflow-auto rounded-lg border border-surface-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-50">
                      <th className="px-3 py-2 text-left font-medium text-surface-600">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-surface-600">Scholar No</th>
                      <th className="px-3 py-2 text-left font-medium text-surface-600">Class</th>
                      <th className="px-3 py-2 text-left font-medium text-surface-600">Father</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {parsed.slice(0, 10).map((s, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5">{s.name}</td>
                        <td className="px-3 py-1.5">{s.scholar_no}</td>
                        <td className="px-3 py-1.5">{s.class}</td>
                        <td className="px-3 py-1.5">{s.father_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 10 && <p className="px-3 py-2 text-xs text-surface-400">...and {parsed.length - 10} more</p>}
              </div>

              <button onClick={handleUpload} disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-600 disabled:opacity-60">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload {parsed.length} Students
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
