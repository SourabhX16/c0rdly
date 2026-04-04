'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  Filter,
  Search,
  Loader2,
  FileSpreadsheet,
  User,
  Building2,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Eye,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import Papa from 'papaparse';
import { updateSubmissionStatus, deleteSubmission } from '@/actions/submissions';
import { Form, FormResponse } from '@/types/database';

interface SubmissionsTableProps {
  initialSubmissions: FormResponse[];
  forms: Form[];
  orgs: string[];
}

export default function SubmissionsTable({
  initialSubmissions,
  forms,
  orgs,
}: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('All');
  const [formFilter, setFormFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateSubmissionStatus(id, newStatus);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setDeletingId(id);
    try {
      await deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setOrgFilter('All');
    setFormFilter('All');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    statusFilter !== 'All' ||
    orgFilter !== 'All' ||
    formFilter !== 'All' ||
    searchQuery ||
    dateFrom ||
    dateTo;

  const filteredAndSorted = useMemo(() => {
    let results = [...submissions];

    if (statusFilter !== 'All') {
      results = results.filter((s) => s.status === statusFilter);
    }
    if (orgFilter !== 'All') {
      results = results.filter((s) => s.org_name === orgFilter);
    }
    if (formFilter !== 'All') {
      results = results.filter((s) => s.form_id === formFilter);
    }
    if (dateFrom) {
      results = results.filter((s) => new Date(s.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter((s) => new Date(s.created_at) <= toDate);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter((sub) => {
        if (sub.org_name?.toLowerCase().includes(q)) return true;
        const form = forms.find((f) => f.id === sub.form_id);
        if (form?.title?.toLowerCase().includes(q)) return true;
        if (sub.status?.toLowerCase().includes(q)) return true;
        if (sub.raw_file_path?.toLowerCase().includes(q)) return true;
        if (sub.data && typeof sub.data === 'object') {
          for (const val of Object.values(sub.data)) {
            if (String(val).toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }

    results.sort((a, b) => {
      let aVal: any = a[sortField as keyof FormResponse];
      let bVal: any = b[sortField as keyof FormResponse];

      if (sortField === 'form_title') {
        aVal = forms.find((f) => f.id === a.form_id)?.title || '';
        bVal = forms.find((f) => f.id === b.form_id)?.title || '';
      }

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [
    submissions,
    statusFilter,
    orgFilter,
    formFilter,
    searchQuery,
    dateFrom,
    dateTo,
    sortField,
    sortOrder,
    forms,
  ]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedSubmissions = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToCSV = () => {
    if (filteredAndSorted.length === 0) return;

    const exportData = filteredAndSorted.map((sub) => {
      const form = forms.find((f) => f.id === sub.form_id);
      return {
        SubmissionID: sub.id,
        Organization: sub.org_name,
        Form: form?.title || 'Unknown',
        Status: sub.status,
        Date: new Date(sub.created_at).toLocaleDateString(),
        ...sub.data,
      };
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `gprs_submissions_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <SortAsc className="w-3 h-3 opacity-30" />;
    return sortOrder === 'asc' ? (
      <SortAsc className="w-3 h-3 text-indigo-600" />
    ) : (
      <SortDesc className="w-3 h-3 text-indigo-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search all fields..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium"
            />
          </div>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
            >
              <option value="All">All Organizations</option>
              {orgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={formFilter}
              onChange={(e) => {
                setFormFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
            >
              <option value="All">All Form Types</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
          <div className="relative group">
            <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium"
              placeholder="From"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium"
              placeholder="To"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-slate-500 font-medium">
          Showing {filteredAndSorted.length} of {submissions.length} submissions
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  #
                </th>
                <th
                  className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('org_name')}
                >
                  <span className="flex items-center gap-1">
                    Client / Organization
                    <SortIcon field="org_name" />
                  </span>
                </th>
                <th
                  className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('form_title')}
                >
                  <span className="flex items-center gap-1">
                    Form Type
                    <SortIcon field="form_title" />
                  </span>
                </th>
                <th
                  className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <span className="flex items-center gap-1">
                    Submitted Date
                    <SortIcon field="created_at" />
                  </span>
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Entries
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Status Update
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubmissions.map((sub, idx) => {
                const form = forms.find((f) => f.id === sub.form_id);
                const isExpanded = expandedId === sub.id;
                return (
                  <>
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : sub.id)
                      }
                    >
                      <td className="px-6 py-4 text-slate-400 font-medium text-xs">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="font-bold text-slate-900">
                            {sub.org_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">
                          {form?.title || 'Unknown Form'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(sub.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {sub.data?.bulkEntries
                          ? `${sub.data.bulkEntries.length} Records`
                          : '1 Entry'}
                      </td>
                      <td className="px-6 py-4 group-hover:pr-10 transition-all">
                        <div className="relative inline-flex items-center">
                          <select
                            value={sub.status || 'Received'}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(sub.id, e.target.value);
                            }}
                            disabled={updatingId === sub.id}
                            className={`text-xs font-black uppercase tracking-wider rounded-xl px-4 py-2 border-0 cursor-pointer shadow-sm transition-all focus:ring-0 ${
                              sub.status === 'Done'
                                ? 'bg-emerald-100 text-emerald-700'
                                : sub.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            <option value="Received">Received</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                          {updatingId === sub.id && (
                            <div className="absolute -right-8">
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : sub.id);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sub.id);
                            }}
                            disabled={deletingId === sub.id}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                              Submission Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Submission ID:
                                </span>
                                <p className="text-slate-800 font-mono text-xs mt-1">
                                  {sub.id}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Organization:
                                </span>
                                <p className="text-slate-800 font-semibold mt-1">
                                  {sub.org_name}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Form:
                                </span>
                                <p className="text-slate-800 font-semibold mt-1">
                                  {form?.title || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Submitted:
                                </span>
                                <p className="text-slate-800 font-semibold mt-1">
                                  {new Date(sub.created_at).toLocaleString()}
                                </p>
                              </div>
                              {sub.raw_file_path && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Uploaded File:
                                  </span>
                                  <p className="text-slate-800 font-mono text-xs mt-1">
                                    {sub.raw_file_path}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                              <div className="bg-white px-4 py-3 border-b border-slate-200">
                                <h5 className="font-semibold text-slate-700 text-sm">
                                  Submitted Data
                                </h5>
                              </div>
                              <div className="bg-white divide-y divide-slate-100">
                                {sub.data &&
                                  Object.entries(sub.data).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="grid grid-cols-3 px-4 py-2 text-sm"
                                      >
                                        <span className="text-slate-500 font-medium capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="col-span-2 text-slate-800">
                                          {typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                        </span>
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-slate-400 font-bold bg-slate-50/20"
                  >
                    No submissions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Page {currentPage} of {totalPages} ({filteredAndSorted.length} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
