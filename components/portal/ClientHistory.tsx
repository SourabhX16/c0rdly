'use client';

import { useState } from 'react';
import { Search, Loader2, History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Done':
        return { icon: CheckCircle2, bg: 'bg-emerald-500/15', color: 'text-emerald-400', badge: 'badge-done' };
      case 'In Progress':
        return { icon: Clock, bg: 'bg-amber-500/15', color: 'text-amber-400', badge: 'badge-in-progress' };
      default:
        return { icon: AlertCircle, bg: 'bg-indigo-500/15', color: 'text-indigo-400', badge: 'badge-received' };
    }
  };

  return (
    <div className="mt-10 pt-10 border-t border-white/[0.06]">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-semibold text-slate-white tracking-tight">
          Track My Submissions
        </h2>
      </div>

      <form onSubmit={handleSearch} className="mb-8 max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your Organization Name..."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="input-dark flex-1"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-dim-steel font-medium italic">
          Enter the exact organization name you used during submission.
        </p>
      </form>

      {submissions && submissions.length > 0 && (
        <div className="space-y-3 animate-crystallize stagger-children">
          {submissions.map((sub) => {
            const config = getStatusConfig(sub.status || 'Received');
            const StatusIcon = config.icon;
            return (
              <div
                key={sub.id}
                className="crystal-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`${config.bg} p-2.5 rounded-xl`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-white">
                      {sub.status || 'Received'}
                    </p>
                    <p className="text-xs text-dim-steel">
                      {new Date(sub.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {(sub.data as any).bulkEntries
                        ? `${(sub.data as any).bulkEntries.length} records`
                        : '1 record'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                  <span className="font-mono text-[11px] font-semibold text-frost-gray uppercase tracking-wider">
                    Ref: {sub.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <div className="glass-card p-8 text-center animate-crystallize">
          <p className="text-sm text-dim-steel font-medium">
            No submissions found for &ldquo;{orgName}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
