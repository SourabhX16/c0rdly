'use client';

import { Form, FormResponse } from '@/types/database';
import Papa from 'papaparse';
import { Download, Table } from 'lucide-react';

export default function OrgResponsesClient({ form, responses, orgName }: { form: Form, responses: FormResponse[], orgName: string }) {
  
  const handleExport = () => {
    // Generate CSV using PapaParse
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
    <div className="bg-white border text-sm border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 flex-wrap gap-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Table className="w-4 h-4 text-gray-500" />
          Data View ({responses.length} rows)
        </h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors font-medium border border-blue-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 whitespace-nowrap">
                Date
              </th>
              {form.fields.map(field => (
                <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {responses.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 sticky left-0 bg-inherit border-r border-gray-100">
                  {new Date(res.created_at).toLocaleDateString()}<br/>
                  <span className="text-[10px] text-gray-400">{new Date(res.created_at).toLocaleTimeString()}</span>
                </td>
                {form.fields.map(field => (
                  <td key={field.id} className="px-6 py-4 text-sm text-gray-900 border-r border-gray-100/50 last:border-r-0">
                    {res.data[field.id] ? (
                       typeof res.data[field.id] === 'string' && res.data[field.id].startsWith('http') 
                        ? <a href={res.data[field.id]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Link</a>
                        : String(res.data[field.id])
                    ) : <span className="text-gray-300">-</span>}
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
