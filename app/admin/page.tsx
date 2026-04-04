import { FileText, Inbox, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle, Edit2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getForms } from '@/actions/forms';
import { getSubmissions } from '@/actions/submissions';

export default async function AdminDashboard() {
  const forms = await getForms();
  const submissions = await getSubmissions();

  const statusCounts = submissions.reduce((acc, sub: any) => {
    const status = sub.status || 'Received';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      label: 'Total Forms',
      value: forms.length,
      icon: FileText,
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
      borderAccent: 'hover:border-indigo-500/30',
    },
    {
      label: 'Total Submissions',
      value: submissions.length,
      icon: Inbox,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      borderAccent: 'hover:border-emerald-500/30',
    },
    {
      label: 'Received',
      value: statusCounts['Received'] || 0,
      icon: AlertCircle,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      borderAccent: 'hover:border-amber-500/30',
      badge: 'badge-received',
    },
    {
      label: 'In Progress',
      value: statusCounts['In Progress'] || 0,
      icon: Clock,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      borderAccent: 'hover:border-blue-500/30',
      badge: 'badge-in-progress',
    },
    {
      label: 'Done',
      value: statusCounts['Done'] || 0,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      borderAccent: 'hover:border-emerald-500/30',
      badge: 'badge-done',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-[1280px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">
            GPRS Admin Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-frost-gray">
            Manage institutional forms and monitor printing requests.
          </p>
        </div>
        <Link
          href="/admin/forms/new"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Create New Form
        </Link>
      </div>

      {/* Stats Row — 5 Crystalline Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 stagger-children">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`crystal-card p-5 ${s.borderAccent}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${s.iconBg} p-2.5 rounded-xl`}>
                <s.icon className={`w-[18px] h-[18px] ${s.iconColor}`} strokeWidth={1.5} />
              </div>
              {s.badge && (
                <span className={s.badge}>{s.label}</span>
              )}
            </div>
            <p className="font-display text-3xl font-bold text-slate-white tracking-tight leading-none">
              {s.value}
            </p>
            <p className="mt-1.5 text-xs font-medium text-dim-steel">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Forms Table — Glass Card Container */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h2 className="font-display text-base font-semibold text-slate-white">
            Active Printing Forms
          </h2>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-white/[0.06] text-frost-gray rounded-full border border-white/[0.06]">
            {forms.length} Total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider">
                  Form Title
                </th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form, idx) => (
                <tr
                  key={form.id}
                  className={`table-row-hover group ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/10">
                        <FileText className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-white group-hover:text-indigo-400 transition-colors duration-150">
                          {form.title}
                        </p>
                        <p className="text-xs text-dim-steel truncate max-w-[220px]">
                          {form.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-dim-steel font-medium">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {new Date(form.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/forms/${form.id}/edit`}
                        className="p-2 text-dim-steel hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-150"
                        title="Edit Form"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                      <Link
                        href={`/f/${form.share_url_id || form.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-150"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Public Link
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4">
                        <FileText className="h-7 w-7 text-dim-steel" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-display text-base font-semibold text-slate-white mb-1.5">
                        No active forms
                      </h3>
                      <p className="text-sm text-dim-steel max-w-xs mb-5">
                        Start by creating your first printing request form to begin collecting institutional data.
                      </p>
                      <Link
                        href="/admin/forms/new"
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        Create First Form
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access — View All Submissions */}
      <Link
        href="/admin/submissions"
        className="crystal-card p-5 flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors duration-150">
            <Inbox className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium text-dim-steel">View All</p>
            <p className="font-display text-base font-semibold text-slate-white">
              Submissions
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-dim-steel group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-150" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
