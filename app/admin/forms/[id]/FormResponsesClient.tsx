'use client';

import { useState } from 'react';
import { Form, FormResponse } from '@/types/database';
import { getAllFormResponsesForExport } from '@/app/actions/form';
import { Download, Users, ArrowLeft, Edit, FileText } from 'lucide-react';
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

  const handleDownloadAllCsv = async () => {
    try {
      setIsExporting(true);
      const responses = await getAllFormResponsesForExport(form.id);
      
      if (responses.length === 0) {
        alert('No responses to export');
        return;
      }

      const fieldIds = form.fields.map(f => f.id);
      const fieldLabels = form.fields.map(f => f.label);
      
      const headers = ['Organization Name', 'Submitted At', ...fieldLabels];
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/admin/forms" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Forms
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            {form.description && (
              <p className="text-gray-500 mt-1">{form.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              {organizations.length} organization{organizations.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadAllCsv}
              disabled={isExporting || organizations.length === 0}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Download All Responses'}
            </button>
            <Link
              href={`/admin/forms/${form.id}/edit`}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Form
            </Link>
            <Link
              href={`/f/${form.share_url_id}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <FileText className="w-4 h-4" />
              View Public Form
            </Link>
          </div>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Share the public form link with organizations to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {organizations.map((org) => (
              <div key={org.org_name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                <div>
                  <h3 className="font-medium text-gray-900">{org.org_name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {org.count} submission{org.count !== 1 ? 's' : ''} · Last: {new Date(org.last_submission).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/admin/forms/${form.id}/${encodeURIComponent(org.org_name)}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                >
                  View Responses →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
