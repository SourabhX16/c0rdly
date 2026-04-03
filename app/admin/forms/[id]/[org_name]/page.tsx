import { getOrganizationResponsesAction } from '@/app/actions/form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div>
        <Link href={`/admin/forms/${form.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizations
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{decodedOrgName}</h1>
            <p className="text-gray-500 mt-1">Data submitted for: <span className="font-semibold text-gray-700">{form.title}</span></p>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
          <p className="text-gray-500">No records found.</p>
        </div>
      ) : (
        <OrgResponsesClient form={form} responses={responses} orgName={decodedOrgName} />
      )}
    </div>
  );
}
