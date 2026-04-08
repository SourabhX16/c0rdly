'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  User,
  FileText,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { AuditLog, Form } from '@/types/database';

interface AuditTableProps {
  initialLogs: AuditLog[];
  forms: Form[];
}

const ACTION_LABELS: Record<string, string> = {
  form_created: 'Form Created',
  form_updated: 'Form Updated',
  form_deleted: 'Form Deleted',
  status_changed: 'Status Changed',
  submission_deleted: 'Submission Deleted',
  org_created: 'Organization Created',
  org_updated: 'Organization Updated',
  org_deleted: 'Organization Deleted',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  form_created: <Plus className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />,
  form_updated: <Edit className="w-4 h-4 text-blue-400" strokeWidth={1.5} />,
  form_deleted: <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />,
  status_changed: <CheckCircle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />,
  submission_deleted: <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />,
  org_created: <Plus className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />,
  org_updated: <Edit className="w-4 h-4 text-blue-400" strokeWidth={1.5} />,
  org_deleted: <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />,
};

export default function AuditTable({ initialLogs, forms }: AuditTableProps) {
  const [logs] = useState(initialLogs);
  const [actionFilter, setActionFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const clearFilters = () => {
    setActionFilter('All');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    actionFilter !== 'All' || dateFrom || dateTo || searchQuery;

  const filteredAndSorted = useMemo(() => {
    let results = [...logs];

    if (actionFilter !== 'All') {
      results = results.filter((l) => l.action === actionFilter);
    }
    if (dateFrom) {
      results = results.filter((l) => new Date(l.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter((l) => new Date(l.created_at) <= toDate);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter((log) => {
        if (log.action.toLowerCase().includes(q)) return true;
        if (log.target_type.toLowerCase().includes(q)) return true;
        if (log.target_id.toLowerCase().includes(q)) return true;
        if (log.details && JSON.stringify(log.details).toLowerCase().includes(q)) return true;
        return false;
      });
    }

    return results;
  }, [logs, actionFilter, dateFrom, dateTo, searchQuery]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedLogs = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getTargetLabel = (log: AuditLog) => {
    if (log.target_type === 'form') {
      const form = forms.find((f) => f.id === log.target_id);
      return form?.title || `Form (${log.target_id.slice(0, 8)}...)`;
    }
    if (log.target_type === 'submission') {
      return `Submission (${log.target_id.slice(0, 8)}...)`;
    }
    if (log.target_type === 'organization') {
      return `Organization (${log.target_id.slice(0, 8)}...)`;
    }
    return log.target_id;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-card-elevated p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-dark w-full !pl-11"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-steel w-4 h-4 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-dark w-full !pl-11 appearance-none"
            >
              <option value="All">All Actions</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="input-dark flex-1 text-sm"
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
              className="input-dark flex-1 text-sm"
              placeholder="To"
            />
          </div>
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
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-dim-steel font-medium">
          Showing {filteredAndSorted.length} of {logs.length} logs
        </div>
      )}

      {/* Table */}
      <div className="glass-card-elevated overflow-hidden animate-fade-in">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  #
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Action
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Target
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Target Type
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Timestamp
                </th>
                <th className="px-6 py-3.5 font-semibold text-dim-steel uppercase tracking-wider text-[11px]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, idx) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className="table-row-hover group cursor-pointer border-b border-white/[0.04]"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : log.id)
                      }
                    >
                      <td className="px-6 py-4 text-dim-steel font-medium text-xs">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ACTION_ICONS[log.action] || (
                            <FileText className="w-4 h-4 text-dim-steel" strokeWidth={1.5} />
                          )}
                          <span className="font-semibold text-slate-white text-sm">
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-frost-gray font-medium text-sm">
                          {getTargetLabel(log)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.06] text-dim-steel text-xs font-bold uppercase border border-white/[0.06]">
                          {log.target_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dim-steel font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-150">
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="space-y-4">
                            <h4 className="font-display font-semibold text-slate-white text-sm uppercase tracking-wide">
                              Log Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Log ID:
                                </span>
                                <p className="text-frost-gray font-mono text-xs mt-1">
                                  {log.id}
                                </p>
                              </div>
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Admin ID:
                                </span>
                                <p className="text-frost-gray font-mono text-xs mt-1">
                                  {log.admin_id || 'System'}
                                </p>
                              </div>
                              <div>
                                <span className="text-dim-steel font-medium">
                                  Target ID:
                                </span>
                                <p className="text-frost-gray font-mono text-xs mt-1">
                                  {log.target_id}
                                </p>
                              </div>
                            </div>
                            {log.details && (
                              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.06]">
                                  <h5 className="font-semibold text-frost-gray text-sm">
                                    Details (JSON)
                                  </h5>
                                </div>
                                <pre className="bg-deep-abyss/50 p-4 text-xs text-frost-gray overflow-x-auto max-h-64 font-mono">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-dim-steel font-semibold"
                  >
                    No audit logs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
