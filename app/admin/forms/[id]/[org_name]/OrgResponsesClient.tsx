'use client';

import { Form, FormResponse } from '@/types/database';
import Papa from 'papaparse';
import { Download, Table } from 'lucide-react';

export default function OrgResponsesClient({ form, responses, orgName }: { form: Form, responses: FormResponse[], orgName: string }) {

  const handleExport = () => {
    const exportData = responses.map(response => {
      const row: Record<string, string> = {
        'Submission Date': new Date(response.created_at).toLocaleString(),
      };
      form.fields.forEach(f => {
        row[f.label] = response.data[f.id] || '';
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${orgName}_${form.title}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card-elevated overflow-hidden text-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-wrap gap-4">
        <h3 className="font-display font-semibold text-slate-white flex items-center gap-2">
          <Table className="w-4 h-4 text-frost-gray" strokeWidth={1.5} />
          Data View ({responses.length} rows)
        </h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors duration-150 font-medium border border-indigo-500/20 text-xs"
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-dim-steel uppercase tracking-wider sticky left-0 bg-midnight-panel z-10 whitespace-nowrap">
                Date
              </th>
              {form.fields.map(field => (
                <th key={field.id} scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-dim-steel uppercase tracking-wider whitespace-nowrap">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((res, idx) => (
              <tr key={res.id} className={`table-row-hover ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-dim-steel sticky left-0 bg-inherit border-r border-white/[0.04]">
                  {new Date(res.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}<br/>
                  <span className="text-[10px] text-dim-steel/70">{new Date(res.created_at).toLocaleTimeString()}</span>
                </td>
                {form.fields.map(field => (
                  <td key={field.id} className="px-6 py-4 text-sm text-slate-white border-r border-white/[0.04] last:border-r-0">
                    {res.data[field.id] ? (
                       typeof res.data[field.id] === 'string' && res.data[field.id].startsWith('http')
                        ? <a href={res.data[field.id]} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150">View Link</a>
                        : String(res.data[field.id])
                    ) : <span className="text-dim-steel/40">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
