'use client';

import { useState, useRef } from 'react';
import { Form, FormField } from '@/types/database';
import { submitBulkFormResponsesAction } from '@/app/actions/form';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, ArrowLeft, Check, AlertCircle, Download } from 'lucide-react';
import levenshtein from 'fast-levenshtein';
import { validateRowData } from '@/lib/validation';

export default function BulkUploadClient({
  form,
  orgName,
  onCancel,
  onSuccess
}: {
  form: Form,
  orgName: string,
  onCancel: () => void,
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showMapping, setShowMapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ row: number, field: string, message: string }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);

    const isCSV = uploadedFile.name.endsWith('.csv');
    const isExcel = uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls');

    if (isCSV) {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setupMapping(results.meta.fields, results.data);
          } else {
            setError("Could not read headers from the CSV file.");
          }
        },
        error: (err) => {
          setError("Failed to parse CSV: " + err.message);
        }
      });
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data: any[] = XLSX.utils.sheet_to_json(ws);

          if (data.length > 0) {
            const headers = Object.keys(data[0]);
            setupMapping(headers, data);
          } else {
            setError("The Excel sheet is empty.");
          }
        } catch (err: any) {
          setError("Failed to parse Excel file: " + err.message);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      setError("Unsupported file format. Please upload a .csv or .xlsx file.");
    }
  };

  const downloadTemplate = () => {
    const headers = form.fields.map(f => f.label);
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const setupMapping = (headers: string[], data: any[]) => {
    setParsedHeaders(headers);
    setParsedData(data);

    const initialMapping: Record<string, string> = {};

    form.fields.forEach(field => {
      let match = headers.find(h => h.toLowerCase().trim() === field.label.toLowerCase().trim());

      if (!match) {
        match = headers.find(h => h.toLowerCase().trim() === field.name.toLowerCase().trim());
      }

      if (!match) {
        let bestMatch = '';
        let minDistance = Infinity;

        headers.forEach(header => {
          const distLabel = levenshtein.get(field.label.toLowerCase(), header.toLowerCase());
          const distName = levenshtein.get(field.name.toLowerCase(), header.toLowerCase());
          const distance = Math.min(distLabel, distName);

          if (distance < minDistance && distance <= 2) {
            minDistance = distance;
            bestMatch = header;
          }
        });

        if (bestMatch) match = bestMatch;
      }

      if (match) {
        initialMapping[field.id] = match;
      }
    });

    setMapping(initialMapping);
    setShowMapping(true);
  };

  const handleSubmit = async (validRowsOnly = false) => {
    if (parsedData.length === 0) return;

    const missingRequired = form.fields.filter(f => f.required && !mapping[f.id]);
    if (missingRequired.length > 0) {
      setError(`Please map the required field(s): ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setValidationErrors(null);

      const formattedRows = parsedData.map((row, index) => {
        const newRow: Record<string, any> = {};
        form.fields.forEach(field => {
          const mappedHeader = mapping[field.id];
          if (mappedHeader && row[mappedHeader] !== undefined) {
            newRow[field.id] = row[mappedHeader];
          } else {
            newRow[field.id] = null;
          }
        });
        return { row: newRow, index };
      });

      const allErrors: { row: number, field: string, message: string }[] = [];
      const validRows: Record<string, any>[] = [];

      for (const { row, index } of formattedRows) {
        const result = validateRowData(row, form.fields);
        if (!result.success) {
          for (const err of result.error.issues) {
            allErrors.push({
              row: index + 1,
              field: err.path[0] as string,
              message: err.message,
            });
          }
        } else {
          validRows.push(row);
        }
      }

      if (allErrors.length > 0 && !validRowsOnly) {
        setValidationErrors(allErrors);
        setIsSubmitting(false);
        return;
      }

      const rowsToSubmit = validRowsOnly ? validRows : formattedRows.map(r => r.row);

      if (rowsToSubmit.length === 0) {
        setError('No valid rows to submit. Please fix the errors and try again.');
        setIsSubmitting(false);
        return;
      }

      await submitBulkFormResponsesAction(form.id, orgName, rowsToSubmit);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            Download CSV Template
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 text-sm text-dim-steel hover:text-slate-white font-medium transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/[0.06] rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/20 transition-all duration-200 group bg-white/[0.02]"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] group-hover:bg-indigo-500/10 mx-auto mb-4 transition-colors duration-200 border border-white/[0.06] group-hover:border-indigo-500/20">
            <UploadCloud className="w-7 h-7 text-dim-steel group-hover:text-indigo-400 transition-colors duration-200" strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg font-semibold text-slate-white">Click to upload your file</p>
          <p className="text-sm text-dim-steel mt-2">Supports .csv and .xlsx formats</p>
        </div>
      ) : showMapping ? (
        <div className="space-y-6">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-white">{file.name}</p>
                <p className="text-xs text-indigo-300">{parsedData.length} records found</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setShowMapping(false);
                setParsedData([]);
              }}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150"
            >
              Replace File
            </button>
          </div>

          {/* Column Mapping Table */}
          <div className="glass-card border border-white/[0.06] rounded-xl overflow-hidden text-sm">
            <div className="bg-white/[0.02] px-4 py-3 border-b border-white/[0.06]">
              <h4 className="font-display font-semibold text-slate-white">Map Columns</h4>
              <p className="text-dim-steel text-xs mt-1">Match your uploaded file columns to the system fields.</p>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {form.fields.map(field => {
                const isMapped = !!mapping[field.id];
                return (
                  <div key={field.id} className="grid grid-cols-2 p-4 items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMapped ? 'bg-emerald-400' : field.required ? 'bg-red-400' : 'bg-white/20'}`} />
                      <span className="font-medium text-frost-gray">{field.label}</span>
                      {field.required && <span className="text-red-400 text-xs">*</span>}
                    </div>
                    <div>
                      <select
                        className="input-dark w-full px-3 py-2 text-sm appearance-none"
                        value={mapping[field.id] || ""}
                        onChange={(e) => setMapping({...mapping, [field.id]: e.target.value})}
                      >
                        <option value="" className="text-dim-steel">-- Do not map --</option>
                        {parsedHeaders.map(header => (
                          <option key={header} value={header} className="bg-deep-abyss">{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
              <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20">
                <h4 className="font-semibold text-red-400 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                  Validation Errors ({validationErrors.length} issues)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-500/5 border-b border-red-500/10">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-red-300">Row</th>
                      <th className="text-left px-4 py-2 font-medium text-red-300">Field</th>
                      <th className="text-left px-4 py-2 font-medium text-red-300">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/10">
                    {validationErrors.map((err, i) => (
                      <tr key={i} className="text-red-300/80">
                        <td className="px-4 py-2">Row {err.row}</td>
                        <td className="px-4 py-2">{err.field}</td>
                        <td className="px-4 py-2">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validationErrors && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-150 active:scale-[0.98]"
            >
              <Check className="w-5 h-5" strokeWidth={1.5} />
              Submit Valid Rows Only
            </button>
          )}

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Importing...' : (
              <>
                <Check className="w-5 h-5" strokeWidth={1.5} />
                Finish Import
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
