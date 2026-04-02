'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileDown, Eye, Loader2 } from 'lucide-react';

interface Props {
  studentId: string;
}

export default function SinglePdfDownload({ studentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const supabase = createClient();

  const generatePdf = async (mode: 'download' | 'preview') => {
    const setter = mode === 'preview' ? setPreviewing : setLoading;
    setter(true);

    try {
      const [{ pdf }, { default: ReportCardTemplate }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/ReportCardTemplate'),
      ]);

      const { data: student, error } = await supabase
        .from('students')
        .select('*, report_cards(*), school:profiles!students_school_id_fkey(school_name, logo_url)')
        .eq('id', studentId)
        .single();

      if (error || !student) throw new Error('Student not found');
      if (!student.report_cards?.length) throw new Error('No report card data yet. Fill in scholastic data first.');

      const report = student.report_cards[0];
      const doc = (
        <ReportCardTemplate
          student={student}
          report={report}
          schoolName={student.school?.school_name || ''}
          logoUrl={student.school?.logo_url || undefined}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      if (mode === 'preview') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.name.replace(/\s+/g, '_')}_Class${student.class}_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setter(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => generatePdf('preview')}
        disabled={previewing || loading}
        className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/50 disabled:opacity-50"
      >
        {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-primary-500" />}
        Preview PDF
      </button>
      <button
        onClick={() => generatePdf('download')}
        disabled={loading || previewing}
        className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        Download PDF
      </button>
    </div>
  );
}
