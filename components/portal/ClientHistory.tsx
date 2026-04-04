'use client';

import { useState } from 'react';
import { Search, Loader2, History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getOrganizationResponsesAction } from '@/app/actions/form';
import { FormResponse } from '@/types/database';

export default function ClientHistory({ formIds }: { formIds: string[] }) {
  const [orgName, setOrgName] = useState('');
  const [submissions, setSubmissions] = useState<FormResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsLoading(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('org_name', orgName.trim())
        .in('form_id', formIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data as FormResponse[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 pt-12 border-t border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-900">Track My Submissions</h2>
      </div>

      <form onSubmit={handleSearch} className="mb-8 max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your Organization Name..."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
          Enter the exact organization name you used during submission.
        </p>
      </form>

      {submissions && submissions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  sub.status === 'Done' ? 'bg-emerald-50 text-emerald-600' :
                  sub.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  {sub.status === 'Done' ? <CheckCircle2 className="w-5 h-5" /> :
                   sub.status === 'In Progress' ? <Clock className="w-5 h-5" /> :
                   <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{sub.status || 'Received'}</p>
                  <p className="text-xs text-slate-500">{new Date(sub.created_at).toLocaleDateString()} • {sub.data.bulkEntries ? `${sub.data.bulkEntries.length} records` : '1 record'}</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reference ID: {sub.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 animate-fade-in">
          <p className="text-sm text-slate-500 font-medium">No submissions found for "{orgName}".</p>
        </div>
      )}
    </div>
  );
}
