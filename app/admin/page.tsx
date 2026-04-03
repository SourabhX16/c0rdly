import { createClient } from '@/lib/supabase/server';
import { FileText, Inbox, Plus, ArrowRight, Clock, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { getForms } from '@/actions/forms';
import { getSubmissions } from '@/actions/submissions';

export default async function AdminDashboard() {
  const forms = await getForms();
  const submissions = await getSubmissions();

  const stats = [
    { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Submissions', value: submissions.length, icon: Inbox, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GPRS Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Manage institutional forms and monitor printing requests.</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
        <Link 
          href="/admin/submissions"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-lg transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition-colors">
              <Inbox className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 text-left">View All</p>
              <p className="text-xl font-bold text-slate-900">Submissions</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 translate-x-0 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Active Printing Forms</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">{forms.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Form Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{form.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{form.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(form.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Link 
                        href={`/admin/forms/${form.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Form"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/f/${form.share_url_id || form.id}`}
                        target="_blank"
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        Public Link
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No active forms. Start by creating your first printing request form.
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
