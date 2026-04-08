'use client';

import React, { useState, useMemo } from 'react';
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
import Link from 'next/link';

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
    if (sortField !== field) return <SortAsc className="w-3 h-3 opacity-30" strokeWidth={1.5} />;
    return sortOrder === 'asc' ? (
      <SortAsc className="w-3 h-3 text-indigo-400" strokeWidth={1.5} />
    ) : (
      <SortDesc className="w-3 h-3 text-indigo-400" strokeWidth={1.5} />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-card-elevated p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
          <div className="bg-midnight-panel rounded-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search all fields..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-dark w-full !pl-11"
              />
            </div>
          </div>
          <div className="bg-midnight-panel rounded-2xl">
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
              <select
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-dark bg-surface-800 text-slate-white w-full !pl-11 appearance-none"
              >
                <option value="All">All Organizations</option>
                {orgs.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-midnight-panel rounded-2xl">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
              <select
                value={formFilter}
                onChange={(e) => {
                  setFormFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-dark bg-surface-800 text-slate-white w-full !pl-11 appearance-none"
              >
                <option value="All">All Form Types</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-midnight-panel rounded-2xl">
            <div className="relative group">
              <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-dark bg-surface-800 text-slate-white w-full !pl-11 appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
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
              className="input-dark text-sm"
              placeholder="From"
            />
            <span className="text-dim-steel text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="input-dark text-sm"
              placeholder="To"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-dim-steel hover:text-slate-white hover:bg-white/5 rounded-xl transition-colors duration-150"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
              Clear
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-150 font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Download className="w-5 h-5" strokeWidth={1.5} />
            Export CSV
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-dim-steel font-medium">
          Showing {filteredAndSorted.length} of {submissions.length} submissions
        </div>
      )}

      <div className="glass-card-elevated overflow-hidden animate-fade-in">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  #
                </th>
                <th
                  className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px] cursor-pointer hover:text-frost-gray select-none"
                  onClick={() => handleSort('org_name')}
                >
                  <span className="flex items-center gap-1">
                    Client / Organization
                    <SortIcon field="org_name" />
                  </span>
                </th>
                <th
                  className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px] cursor-pointer hover:text-frost-gray select-none"
                  onClick={() => handleSort('form_title')}
                >
                  <span className="flex items-center gap-1">
                    Form Type
                    <SortIcon field="form_title" />
                  </span>
                </th>
                <th
                  className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px] cursor-pointer hover:text-frost-gray select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <span className="flex items-center gap-1">
                    Submitted Date
                    <SortIcon field="created_at" />
                  </span>
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Entries
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Status Update
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((sub, idx) => {
                const form = forms.find((f) => f.id === sub.form_id);
                const isExpanded = expandedId === sub.id;
                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      className="table-row-hover group cursor-pointer border-b border-white/[0.04]"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : sub.id)
                      }
                    >
                      <td className="px-6 py-4 text-dim-steel font-medium text-xs">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/10">
                            <Building2 className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-white group-hover:text-indigo-400 transition-colors duration-150">
                              {sub.org_name}
                            </span>
                            {form && (
                              <Link
                                href={`/admin/forms/${form.id}/${encodeURIComponent(sub.org_name)}`}
                                className="block text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View all responses →
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-frost-gray font-medium">
                          {form?.title || 'Unknown Form'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dim-steel font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-400">
                        1 Entry
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
                            className={`text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 border cursor-pointer transition-all duration-150 focus:ring-0 ${
                              sub.status === 'Done'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : sub.status === 'In Progress'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            <option value="Received">Received</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                          {updatingId === sub.id && (
                            <div className="absolute -right-8">
                              <Loader2 className="w-4 h-4 text-frost-gray animate-spin" />
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
                            className="p-2 text-dim-steel hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors duration-150"
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
                            className="p-2 text-dim-steel hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-150 disabled:opacity-40"
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
                      <tr className="bg-white/[0.02]">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="space-y-4">
                            <h4 className="font-display font-semibold text-slate-white text-sm uppercase tracking-wide">
                              Submission Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Submission ID:
                                </span>
                                <p className="text-frost-gray font-mono text-xs mt-1">
                                  {sub.id}
                                </p>
                              </div>
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Organization:
                                </span>
                                <p className="text-slate-white font-semibold mt-1">
                                  {sub.org_name}
                                </p>
                              </div>
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Form:
                                </span>
                                <p className="text-slate-white font-semibold mt-1">
                                  {form?.title || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Submitted:
                                </span>
                                <p className="text-slate-white font-semibold mt-1">
                                  {new Date(sub.created_at).toLocaleString()}
                                </p>
                              </div>
                              {sub.raw_file_path && (
                                <div>
                                    <span className="text-dim-steel font-medium">
                                      Uploaded File:
                                    </span>
                                    <p className="text-frost-gray font-mono text-xs mt-1">
                                      {sub.raw_file_path}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                              <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.06]">
                                <h5 className="font-semibold text-frost-gray text-sm">
                                  Submitted Data
                                </h5>
                              </div>
                              <div className="divide-y divide-white/[0.04]">
                                {sub.data &&
                                  Object.entries(sub.data).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="grid grid-cols-3 px-4 py-2 text-sm"
                                      >
                                        <span className="text-dim-steel font-medium capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="col-span-2 text-slate-white">
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
                  </React.Fragment>
                );
              })}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-dim-steel font-semibold"
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
        <div className="flex items-center justify-between glass-card px-6 py-4">
          <p className="text-sm text-dim-steel font-medium">
            Page {currentPage} of {totalPages} ({filteredAndSorted.length} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-white/[0.06] text-dim-steel hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
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
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                    currentPage === page
                      ? 'bg-indigo-primary text-white shadow-lg shadow-indigo-primary/20'
                      : 'text-frost-gray hover:bg-white/5'
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
              className="p-2 rounded-xl border border-white/[0.06] text-dim-steel hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
