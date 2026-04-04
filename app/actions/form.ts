'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Form, FormField, FormResponse } from '@/types/database';
import { logAuditAction } from '@/lib/audit';
import { checkRateLimit } from '@/lib/rate-limit';

export async function createFormAction(data: { title: string; description: string; fields: FormField[] }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  const { data: newForm, error } = await supabase
    .from('forms')
    .insert({
      created_by: userData.user.id,
      title: data.title,
      description: data.description,
      fields: data.fields,
      // share_url_id is generated automatically by gen_random_uuid()
    })
    .select()
    .single();

  if (error) {
    console.error('Create form error:', error);
    throw new Error('Failed to create form');
  }

  await logAuditAction('form_created', 'form', newForm.id, { title: data.title, fields_count: data.fields.length });

  revalidatePath('/admin/forms');
  return newForm;
}

export async function getAdminFormsAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch forms error:', error);
    return [];
  }

  return data as Form[];
}

export async function getFormByShareIdAction(shareUrlId: string) {
  const supabase = await createClient();
  // Public select - bypass RLS is allowed by policy "Anyone can view forms by share_url_id"
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('share_url_id', shareUrlId)
    .single();

  if (error) {
    console.error('Fetch form error:', error);
    return null;
  }

  return data as Form;
}

export async function submitFormResponseAction(formId: string, orgName: string, data: Record<string, any>) {
  const limitResult = checkRateLimit('form_submit');
  if (!limitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(limitResult.retryAfterMs / 1000)}s`);
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('form_responses')
    .insert({
      form_id: formId,
      org_name: orgName,
      data: data,
    });

  if (error) {
    console.error('Submit form error:', error);
    throw new Error('Failed to submit form: ' + error.message);
  }

  return { success: true };
}

export async function getFormResponsesAction(formId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch form responses error:', error);
    return [];
  }

  return data as FormResponse[];
}

export async function submitBulkFormResponsesAction(formId: string, orgName: string, rows: Record<string, any>[]) {
  const limitResult = checkRateLimit('bulk_upload');
  if (!limitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(limitResult.retryAfterMs / 1000)}s`);
  }

  const supabase = await createClient();
  
  // Format the rows for insertion
  const inserts = rows.map(row => ({
    form_id: formId,
    org_name: orgName,
    data: row,
  }));

  const { error } = await supabase
    .from('form_responses')
    .insert(inserts);

  if (error) {
    console.error('Submit bulk form error:', error);
    throw new Error('Failed to submit bulk records: ' + error.message);
  }

  return { success: true, count: rows.length };
}

export async function getFormOrganizationsAction(formId: string) {
  const supabase = await createClient();
  
  // Since Supabase RPC or distinct is sometimes tricky with typed clients,
  // we can just fetch the distinct org_names by selecting them, 
  // or fetching all and reducing. For larger datasets, an RPC is better.
  // For V1, we'll fetch just org_names and aggregate count.
  const { data, error } = await supabase
    .from('form_responses')
    .select('org_name, created_at')
    .eq('form_id', formId);

  if (error) {
    console.error('Fetch orgs error:', error);
    return [];
  }

  // Aggregate by org_name in JS
  const orgMap = new Map<string, { org_name: string, count: number, last_submission: string }>();
  
  for (const row of data as any[]) {
    if (!orgMap.has(row.org_name)) {
      orgMap.set(row.org_name, { org_name: row.org_name, count: 0, last_submission: row.created_at });
    }
    const current = orgMap.get(row.org_name)!;
    current.count += 1;
    if (new Date(row.created_at) > new Date(current.last_submission)) {
      current.last_submission = row.created_at;
    }
  }

  return Array.from(orgMap.values()).sort((a, b) => new Date(b.last_submission).getTime() - new Date(a.last_submission).getTime());
}

export async function getOrganizationResponsesAction(formId: string, orgName: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .eq('org_name', orgName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch org responses error:', error);
    return [];
  }

  return data as FormResponse[];
}

