'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';

interface Props {
  schoolId: string;
}

export default function ExportExcel({ schoolId }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleExport = async () => {
    setLoading(true);
    try {
      // Dynamic import to keep xlsx out of main bundle
      const XLSX = await import('xlsx');

      // Fetch students with reports
      const { data: students, error } = await supabase
        .from('students')
        .select('*, report_cards(*)')
        .eq('school_id', schoolId)
        .order('class')
        .order('name');

      if (error) throw error;
      if (!students || students.length === 0) {
        alert('No student data to export.');
        return;
      }

      // Build flat rows for Excel
      const rows = students.map((s) => {
        const report = s.report_cards?.[0];
        const scholastic = (report?.scholastic_data || []) as { subject: string; total: number | null; grade: string | null }[];
        const attendance = report?.attendance as { total_days?: number; present_days?: number; percentage?: number } | null;

        const subjectCols: Record<string, string> = {};
        scholastic.forEach((sub) => {
          subjectCols[`${sub.subject} (Total)`] = sub.total != null ? String(sub.total) : '';
          subjectCols[`${sub.subject} (Grade)`] = sub.grade || '';
        });

        return {
          'Name': s.name,
          'Scholar No': s.scholar_no,
          'Roll No': s.roll_no,
          'Class': s.class,
          'Section': s.section || '',
          'Medium': s.medium,
          'DOB': s.dob,
          'Father Name': s.father_name,
          'Mother Name': s.mother_name,
          'SSSM ID': s.sssm_id || '',
          'Family ID': s.family_id || '',
          'Aadhar No': s.aadhar_no || '',
          'Session': report?.session || '',
          ...subjectCols,
          'Total Working Days': attendance?.total_days ?? '',
          'Days Present': attendance?.present_days ?? '',
          'Attendance %': attendance?.percentage != null ? `${attendance.percentage}%` : '',
          'Teacher Remarks': report?.teacher_remarks || '',
          'Promoted To': report?.promoted_to || '',
        };
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      // Auto-fit column widths
      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] || '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      // Download
      XLSX.writeFile(wb, `c0rdly_students_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 shadow-sm transition-all hover:border-accent-300 hover:bg-accent-50/50 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-accent-600" />}
      Export Excel
    </button>
  );
}
