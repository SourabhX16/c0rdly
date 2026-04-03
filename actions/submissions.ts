'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSubmissions(formId?: string) {
  const supabase = await createClient();
  let query = supabase.from('form_responses').select('*');

  if (formId && formId !== 'All') {
    query = query.eq('form_id', formId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function submitResponse(submission: { form_id: string; org_name: string; data: any; raw_file_path?: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('form_responses').insert(submission);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/submissions');
  revalidatePath('/portal');
}

export async function updateSubmissionStatus(id: string, status: string) {
  // Assuming we add a 'status' field to form_responses to match c0rdly2
  const supabase = await createClient();
  const { error } = await supabase
    .from('form_responses')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/submissions');
}
