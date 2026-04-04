import { getAdminFormsAction } from '@/app/actions/form';
import Link from 'next/link';
import { PlusCircle, Link as LinkIcon, Edit, Eye, Users, FileText, Copy, Hash } from 'lucide-react';
import CopyShareUrl from '@/components/admin/CopyShareUrl';

export default async function AdminFormsPage() {
  const forms = await getAdminFormsAction();

  return (
    <div className="animate-fade-in max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">
            Data Request Forms
          </h1>
          <p className="mt-1.5 text-sm text-frost-gray">
            Create and manage data collection forms for printing operations.
          </p>
        </div>
        <Link
          href="/admin/forms/new"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" strokeWidth={2} />
          Create Form
        </Link>
      </div>

      {/* Forms Grid or Empty State */}
      {forms.length === 0 ? (
        <div className="glass-card-elevated flex flex-col items-center justify-center py-20 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/10 mb-5">
            <FileText className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-lg font-semibold text-slate-white mb-2">
            No forms created yet
          </h2>
          <p className="text-sm text-dim-steel max-w-sm text-center mb-6 leading-relaxed">
            Get started by creating your first dynamic form to begin collecting data from organizations.
          </p>
          <Link
            href="/admin/forms/new"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" strokeWidth={2} />
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {forms.map((form) => (
            <div
              key={form.id}
              className="crystal-card flex flex-col group"
            >
              {/* Card Body */}
              <div className="p-6 flex-1">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/10 group-hover:bg-indigo-500/25 transition-colors duration-200">
                    <FileText className="h-5 w-5 text-indigo-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-slate-white group-hover:text-indigo-400 transition-colors duration-150 truncate">
                      {form.title}
                    </h3>
                    <p className="text-sm text-dim-steel line-clamp-2 mt-1 leading-relaxed">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Metadata Chips */}
                <div className="flex items-center gap-2 text-xs mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg font-medium text-frost-gray">
                    <Hash className="w-3 h-3" strokeWidth={1.5} />
                    {form.fields.length} Fields
                  </span>
                  <span className="text-dim-steel">
                    {new Date(form.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Share URL Block */}
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="font-mono text-xs text-indigo-400 truncate pr-3">
                    /f/{form.share_url_id}
                  </p>
                  <CopyShareUrl shareUrlId={form.share_url_id} />
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-white/[0.06] px-6 py-3.5 flex justify-between items-center">
                <Link
                  href={`/admin/forms/${form.id}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-frost-gray hover:text-indigo-400 transition-colors duration-150"
                >
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Responses
                </Link>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/forms/${form.id}/edit`}
                    className="p-2 text-dim-steel hover:text-slate-white hover:bg-white/[0.05] rounded-lg transition-all duration-150"
                    title="Edit Form"
                  >
                    <Edit className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={`/f/${form.share_url_id}`}
                    target="_blank"
                    className="p-2 text-dim-steel hover:text-slate-white hover:bg-white/[0.05] rounded-lg transition-all duration-150"
                    title="View Public Form"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
