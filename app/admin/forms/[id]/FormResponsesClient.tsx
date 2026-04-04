'use client';

import { useState } from 'react';
import { Form, FormResponse } from '@/types/database';
import { getAllFormResponsesForExport } from '@/app/actions/form';
import { Download, Users, ArrowLeft, Edit, FileText, ExternalLink, ChevronRight, Building2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';

export default function FormResponsesClient({
  form,
  organizations
}: {
  form: Form;
  organizations: { org_name: string; count: number; last_submission: string }[];
}) {
  const [isExporting, setIsExporting] = useState(false);

  const totalSubmissions = organizations.reduce((sum, org) => sum + org.count, 0);

  const handleDownloadAllCsv = async () => {
    try {
      setIsExporting(true);
      const responses = await getAllFormResponsesForExport(form.id);

      if (responses.length === 0) {
        alert('No responses to export');
        return;
      }

      const rows = responses.map((r: FormResponse) => {
        const rowData = r.data as Record<string, unknown>;
        return {
          'Organization Name': r.org_name,
          'Submitted At': new Date(r.created_at).toLocaleString(),
          ...Object.fromEntries(
            form.fields.map(f => [f.label, rowData[f.id] ?? ''])
          )
        };
      });

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_all_responses.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1280px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/forms"
          className="text-dim-steel hover:text-indigo-400 transition-colors duration-150 font-medium"
        >
          Forms
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim-steel" strokeWidth={1.5} />
        <span className="text-slate-white font-medium truncate max-w-[200px]">
          {form.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-sm text-frost-gray mt-1.5 max-w-lg leading-relaxed">
              {form.description}
            </p>
          )}
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleDownloadAllCsv}
            disabled={isExporting || organizations.length === 0}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {isExporting ? 'Exporting...' : 'Download All'}
          </button>
          <Link
            href={`/admin/forms/${form.id}/edit`}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" strokeWidth={1.5} />
            Edit
          </Link>
          <Link
            href={`/f/${form.share_url_id}`}
            target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            Public Form
          </Link>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="crystal-card p-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/15 p-2.5 rounded-xl">
              <Building2 className="w-[18px] h-[18px] text-indigo-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-medium text-dim-steel">Organizations</p>
              <p className="font-display text-2xl font-bold text-slate-white">
                {organizations.length}
              </p>
            </div>
          </div>
        </div>
        <div className="crystal-card p-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/15 p-2.5 rounded-xl">
              <FileText className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-medium text-dim-steel">Total Submissions</p>
              <p className="font-display text-2xl font-bold text-slate-white">
                {totalSubmissions}
              </p>
            </div>
          </div>
        </div>
        <div className="crystal-card p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/15 p-2.5 rounded-xl">
              <Clock className="w-[18px] h-[18px] text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-medium text-dim-steel">Form Fields</p>
              <p className="font-display text-2xl font-bold text-slate-white">
                {form.fields.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      {organizations.length === 0 ? (
        <div className="glass-card-elevated flex flex-col items-center justify-center py-16 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4">
            <Users className="h-7 w-7 text-dim-steel" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-base font-semibold text-slate-white mb-1.5">
            No submissions yet
          </h3>
          <p className="text-sm text-dim-steel max-w-sm text-center leading-relaxed">
            Share the public form link with organizations to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="glass-card-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-white">
              Organizations
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-white/[0.06] text-frost-gray rounded-full border border-white/[0.06]">
              {organizations.length} Total
            </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider">
                  Organization Name
                </th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider">
                  Last Submitted
                </th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-dim-steel uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org, idx) => (
                <tr
                  key={org.org_name}
                  className={`table-row-hover group ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/10">
                        <Building2 className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-semibold text-slate-white group-hover:text-indigo-400 transition-colors duration-150">
                        {org.org_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-display text-sm font-semibold text-slate-white">
                      {org.count}
                    </span>
                    <span className="text-xs text-dim-steel ml-1">
                      record{org.count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-dim-steel font-medium">
                      {new Date(org.last_submission).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/forms/${form.id}/${encodeURIComponent(org.org_name)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
                    >
                      View Responses
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
