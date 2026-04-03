'use client';

import { useState } from 'react';
import { Download, Filter, Search, Loader2, FileSpreadsheet, User, Building2, Calendar, ClipboardCheck } from 'lucide-react';
import Papa from 'papaparse';
import { updateSubmissionStatus } from '@/actions/submissions';
import { Form, FormResponse } from '@/types/database';

interface SubmissionsTableProps {
  initialSubmissions: FormResponse[];
  forms: Form[];
}

export default function SubmissionsTable({ initialSubmissions, forms }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('');
  const [formFilter, setFormFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateSubmissionStatus(id, newStatus);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (statusFilter !== 'All' && sub.status !== statusFilter) return false;
    if (formFilter !== 'All' && sub.form_id !== formFilter) return false;
    if (orgFilter && !sub.org_name.toLowerCase().includes(orgFilter.toLowerCase())) return false;
    return true;
  });

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const exportData = filteredSubmissions.map(sub => {
      const form = forms.find(f => f.id === sub.form_id);
      return {
        SubmissionID: sub.id,
        Organization: sub.org_name,
        Form: form?.title || 'Unknown',
        Status: sub.status,
        Date: new Date(sub.created_at).toLocaleDateString(),
        ...sub.data
      };
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gprs_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
           <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search Organization..."
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
            >
              <option value="All">All Form Types</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
          <div className="relative group">
            <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none font-medium appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Client / Organization</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Form Type</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Submitted Date</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Entries</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="font-bold text-slate-900">{sub.org_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{forms.find(f => f.id === sub.form_id)?.title || 'Unknown Form'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" />
                       {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {sub.data.bulkEntries ? `${sub.data.bulkEntries.length} Records` : '1 Entry'}
                  </td>
                  <td className="px-6 py-4 group-hover:pr-10 transition-all">
                    <div className="relative inline-flex items-center">
                      <select
                        value={sub.status || 'Received'}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        disabled={updatingId === sub.id}
                        className={`text-xs font-black uppercase tracking-wider rounded-xl px-4 py-2 border-0 cursor-pointer shadow-sm transition-all focus:ring-0 ${
                          sub.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                          sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
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
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold bg-slate-50/20">
                    No submissions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
