'use client';

import { useState, useMemo } from 'react';
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
  form_created: <Plus className="w-4 h-4 text-emerald-600" />,
  form_updated: <Edit className="w-4 h-4 text-blue-600" />,
  form_deleted: <Trash2 className="w-4 h-4 text-red-600" />,
  status_changed: <CheckCircle className="w-4 h-4 text-amber-600" />,
  submission_deleted: <Trash2 className="w-4 h-4 text-red-600" />,
  org_created: <Plus className="w-4 h-4 text-emerald-600" />,
  org_updated: <Edit className="w-4 h-4 text-blue-600" />,
  org_deleted: <Trash2 className="w-4 h-4 text-red-600" />,
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
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
              className="flex-1 px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium"
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
              className="flex-1 px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium"
              placeholder="To"
            />
          </div>
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
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-slate-500 font-medium">
          Showing {filteredAndSorted.length} of {logs.length} logs
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
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Action
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Target
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Target Type
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Timestamp
                </th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log, idx) => {
                const isExpanded = expandedId === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/30 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : log.id)
                      }
                    >
                      <td className="px-6 py-4 text-slate-400 font-medium text-xs">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ACTION_ICONS[log.action] || (
                            <FileText className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="font-semibold text-slate-800 text-sm">
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium text-sm">
                          {getTargetLabel(log)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                          {log.target_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                              Log Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Log ID:
                                </span>
                                <p className="text-slate-800 font-mono text-xs mt-1">
                                  {log.id}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Admin ID:
                                </span>
                                <p className="text-slate-800 font-mono text-xs mt-1">
                                  {log.admin_id || 'System'}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">
                                  Target ID:
                                </span>
                                <p className="text-slate-800 font-mono text-xs mt-1">
                                  {log.target_id}
                                </p>
                              </div>
                            </div>
                            {log.details && (
                              <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-white px-4 py-3 border-b border-slate-200">
                                  <h5 className="font-semibold text-slate-700 text-sm">
                                    Details (JSON)
                                  </h5>
                                </div>
                                <pre className="bg-white p-4 text-xs text-slate-700 overflow-x-auto max-h-64">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-slate-400 font-bold bg-slate-50/20"
                  >
                    No audit logs found matching your filters.
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
