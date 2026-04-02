'use client';

import { useState } from 'react';
import type { Student, ReportCard } from '@/types/database';
import { Search, Plus, Edit2, Trash2, FileText, ChevronLeft, ChevronRight, Users, Upload } from 'lucide-react';
import Link from 'next/link';
import { deleteStudent } from '@/actions/students';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface Props {
  students: (Student & { report_cards: ReportCard[] })[];
}

export default function StudentsTable({ students }: Props) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const router = useRouter();

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.scholar_no.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const uniqueClasses = [...new Set(students.map((s) => s.class))].sort((a, b) => Number(a) - Number(b));

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    await deleteStudent(id);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search name or scholar no..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500">
            <option value="">All Classes</option>
            {uniqueClasses.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <Link href="/dashboard/students/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Student
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="px-4 py-3 font-semibold text-surface-600">Name</th>
                <th className="px-4 py-3 font-semibold text-surface-600">Scholar No</th>
                <th className="px-4 py-3 font-semibold text-surface-600">Class</th>
                <th className="px-4 py-3 font-semibold text-surface-600">DOB</th>
                <th className="px-4 py-3 font-semibold text-surface-600">Father</th>
                <th className="px-4 py-3 font-semibold text-surface-600">Report</th>
                <th className="px-4 py-3 font-semibold text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    {students.length === 0 ? (
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                          <Users className="h-8 w-8 text-primary-400" />
                        </div>
                        <p className="text-base font-semibold text-surface-700">No students yet</p>
                        <p className="mt-1 text-sm text-surface-400">Get started by adding your first student or uploading a CSV file.</p>
                        <div className="mt-5 flex items-center justify-center gap-3">
                          <Link href="/dashboard/students/new"
                            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700">
                            <Plus className="h-3.5 w-3.5" /> Add Student
                          </Link>
                          <Link href="/dashboard/upload"
                            className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-50">
                            <Upload className="h-3.5 w-3.5" /> Upload CSV
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Search className="mx-auto h-8 w-8 text-surface-300" />
                        <p className="mt-2 text-sm text-surface-400">No students match your search or filters.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : paginated.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface-50/50">
                  <td className="px-4 py-3 font-medium text-surface-900">
                    <span className="block max-w-[200px] truncate" title={s.name}>{s.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{s.scholar_no || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      Class {s.class}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{s.dob ? formatDate(s.dob) : '—'}</td>
                  <td className="px-4 py-3 text-surface-600">
                    <span className="block max-w-[160px] truncate" title={s.father_name}>{s.father_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.report_cards?.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-600">
                        <FileText className="h-3.5 w-3.5" /> {s.report_cards.length}
                      </span>
                    ) : (
                      <span className="text-xs text-surface-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/students/${s.id}/edit`}
                        className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-primary-50 hover:text-primary-600">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(s.id, s.name)}
                        className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-danger-500/10 hover:text-danger-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-100 px-4 py-3">
            <p className="text-sm text-surface-500">
              {filtered.length} student{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
