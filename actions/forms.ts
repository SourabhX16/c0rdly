'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getForms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getFormById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function saveForm(formData: { title: string; description: string; fields: any[]; id?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { id, title, description, fields } = formData;

  if (id && id !== 'new') {
    const { error } = await supabase
      .from('forms')
      .update({ title, description, fields, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('forms')
      .insert({ title, description, fields, created_by: user.id });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin');
}

export async function deleteForm(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}
