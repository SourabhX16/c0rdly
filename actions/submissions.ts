'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';

export async function getSubmissions(params?: {
  formId?: string;
  status?: string;
  orgName?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const supabase = await createClient();
  let query = supabase.from('form_responses').select('*');

  if (params?.formId && params.formId !== 'All') {
    query = query.eq('form_id', params.formId);
  }

  if (params?.status && params.status !== 'All') {
    query = query.eq('status', params.status);
  }

  if (params?.orgName) {
    query = query.ilike('org_name', `%${params.orgName}%`);
  }

  if (params?.dateFrom) {
    query = query.gte('created_at', params.dateFrom);
  }

  if (params?.dateTo) {
    query = query.lte('created_at', params.dateTo);
  }

  const sortField = params?.sortBy || 'created_at';
  const sortOrder = params?.sortOrder || 'desc';
  const { data, error } = await query.order(sortField, { ascending: sortOrder === 'asc' });

  if (error) throw new Error(error.message);

  let results = data || [];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    results = results.filter((sub: any) => {
      if (sub.org_name?.toLowerCase().includes(searchLower)) return true;
      if (sub.status?.toLowerCase().includes(searchLower)) return true;
      if (sub.raw_file_path?.toLowerCase().includes(searchLower)) return true;
      if (sub.data && typeof sub.data === 'object') {
        for (const val of Object.values(sub.data)) {
          if (String(val).toLowerCase().includes(searchLower)) return true;
        }
      }
      return false;
    });
  }

  return results;
}

export async function submitResponse(submission: { form_id: string; org_name: string; data: any; raw_file_path?: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('form_responses').insert(submission);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/submissions');
  revalidatePath('/portal');
}

export async function updateSubmissionStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('form_responses')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('status_changed', 'submission', id, { new_status: status });
  revalidatePath('/admin/submissions');
}

export async function deleteSubmission(id: string) {
  const supabase = await createClient();
  await logAuditAction('submission_deleted', 'submission', id, { id });
  const { error } = await supabase
    .from('form_responses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/submissions');
}

export async function getUniqueOrgs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('form_responses')
    .select('org_name')
    .order('org_name');

  if (error) throw new Error(error.message);

  const orgs = [...new Set((data || []).map((d: any) => d.org_name))].filter(Boolean).sort();
  return orgs as string[];
}
