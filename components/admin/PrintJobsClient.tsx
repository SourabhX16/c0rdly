'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CLASS_OPTIONS } from '@/lib/utils';
import { Printer, Download, Loader2, Search, Filter, CheckSquare, Square } from 'lucide-react';

interface StudentRow {
  id: string;
  name: string;
  scholar_no: string;
  class: string;
  school_id: string;
  school_name: string;
  has_report: boolean;
}

export default function PrintJobsClient() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [classFilter, setClassFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<{ id: string; school_name: string }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: schls } = await supabase
        .from('profiles')
        .select('id, school_name')
        .eq('role', 'school')
        .order('school_name');
      setSchools(schls || []);

      const { data: studs } = await supabase
        .from('students')
        .select('id, name, scholar_no, class, school_id, report_cards(id)')
        .order('class')
        .order('name');

      const rows: StudentRow[] = (studs || []).map((s) => {
        const sch = (schls || []).find((sc) => sc.id === s.school_id);
        return {
          id: s.id, name: s.name, scholar_no: s.scholar_no,
          class: s.class, school_id: s.school_id,
          school_name: sch?.school_name || 'Unknown',
          has_report: Array.isArray(s.report_cards) && s.report_cards.length > 0,
        };
      });
      setStudents(rows);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const matchClass = !classFilter || s.class === classFilter;
    const matchSchool = !schoolFilter || s.school_id === schoolFilter;
    const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSchool && matchSearch;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleGenerate = async () => {
    if (selected.size === 0) return;
    setGenerating(true);

    try {
      // Dynamic imports for client-side PDF generation
      const [{ pdf }, { default: JSZip }, { saveAs }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('jszip'),
        import('file-saver'),
      ]);

      const { default: ReportCardTemplate } = await import('@/components/pdf/ReportCardTemplate');

      const zip = new JSZip();
      const ids = Array.from(selected);

      for (const id of ids) {
        const { data: student } = await supabase
          .from('students')
          .select('*, report_cards(*), school:profiles!students_school_id_fkey(school_name, logo_url)')
          .eq('id', id)
          .single();

        if (!student || !student.report_cards?.length) continue;

        const report = student.report_cards[0];
        const doc = <ReportCardTemplate student={student} report={report} schoolName={student.school?.school_name || ''} logoUrl={student.school?.logo_url || undefined} />;
        const blob = await pdf(doc).toBlob();
        zip.file(`${student.name.replace(/\s+/g, '_')}_Class${student.class}.pdf`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `c0rdly_report_cards_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDFs. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search students..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500" />
        </div>
        <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}
          className="rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm">
          <option value="">All Schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.school_name}</option>)}
        </select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm">
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <button onClick={handleGenerate} disabled={selected.size === 0 || generating}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Generate {selected.size > 0 ? `${selected.size} PDFs` : 'PDFs'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50">
              <th className="px-4 py-3 w-10">
                <button onClick={toggleAll}>
                  {selected.size === filtered.length && filtered.length > 0
                    ? <CheckSquare className="h-4 w-4 text-primary-600" />
                    : <Square className="h-4 w-4 text-surface-400" />}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold text-surface-600">Name</th>
              <th className="px-4 py-3 font-semibold text-surface-600">Scholar No</th>
              <th className="px-4 py-3 font-semibold text-surface-600">Class</th>
              <th className="px-4 py-3 font-semibold text-surface-600">School</th>
              <th className="px-4 py-3 font-semibold text-surface-600">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-surface-400">No students found</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-surface-50/50">
                <td className="px-4 py-3">
                  <button onClick={() => toggleOne(s.id)}>
                    {selected.has(s.id)
                      ? <CheckSquare className="h-4 w-4 text-primary-600" />
                      : <Square className="h-4 w-4 text-surface-400" />}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-surface-900">{s.name}</td>
                <td className="px-4 py-3 text-surface-600">{s.scholar_no}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                    Class {s.class}
                  </span>
                </td>
                <td className="px-4 py-3 text-surface-600">{s.school_name}</td>
                <td className="px-4 py-3">
                  {s.has_report
                    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-600"><Printer className="h-3 w-3" /> Ready</span>
                    : <span className="text-xs text-surface-400">No data</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-surface-400">{selected.size} of {filtered.length} selected</p>
    </div>
  );
}
