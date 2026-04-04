import { getOrganizationResponsesAction } from '@/app/actions/form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import OrgResponsesClient from './OrgResponsesClient';

export default async function OrgResponsesPage({ params }: { params: { id: string, org_name: string } }) {
  const resolvedParams = await params;
  const decodedOrgName = decodeURIComponent(resolvedParams.org_name);

  const supabase = await createClient();
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!form) {
    notFound();
  }

  const responses = await getOrganizationResponsesAction(form.id, decodedOrgName);

  return (
    <div className="max-w-full mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/admin/forms" className="text-dim-steel hover:text-indigo-400 transition-colors duration-150 font-medium">
          Forms
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim-steel" strokeWidth={1.5} />
        <Link href={`/admin/forms/${form.id}`} className="text-dim-steel hover:text-indigo-400 transition-colors duration-150 font-medium truncate max-w-[140px]">
          {form.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim-steel" strokeWidth={1.5} />
        <span className="text-slate-white font-medium truncate max-w-[200px]">
          {decodedOrgName}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">{decodedOrgName}</h1>
          <p className="text-sm text-frost-gray mt-1.5">
            Data submitted for: <span className="font-semibold text-slate-white">{form.title}</span>
          </p>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="glass-card-elevated flex flex-col items-center justify-center py-16 px-8">
          <p className="text-sm text-dim-steel font-medium">No records found.</p>
        </div>
      ) : (
        <OrgResponsesClient form={form} responses={responses} orgName={decodedOrgName} />
      )}
    </div>
  );
}
