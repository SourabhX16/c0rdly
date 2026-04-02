'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { StudentFormData } from '@/types/database';

export async function getStudents(schoolId?: string) {
  const supabase = await createClient();
  let query = supabase.from('students').select('*, report_cards(*)').order('name');

  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getStudent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*, report_cards(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createStudent(schoolId: string, formData: StudentFormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .insert({ ...formData, school_id: schoolId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/students');
  return data;
}

export async function updateStudent(id: string, formData: Partial<StudentFormData>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/students');
  return data;
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/students');
}

export async function bulkInsertStudents(schoolId: string, students: StudentFormData[]) {
  const supabase = await createClient();

  // Authenticate and rate-limit
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { checkRateLimit } = await import('@/lib/rate-limit');
  const { allowed, retryAfterMs } = checkRateLimit(`bulk:${user.id}`);
  if (!allowed) {
    const seconds = Math.ceil(retryAfterMs / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${seconds} seconds before uploading again.`);
  }

  // Cap at 500 students per upload
  if (students.length > 500) {
    throw new Error('Maximum 500 students per upload. Please split your CSV into smaller files.');
  }

  const rows = students.map((s) => ({ ...s, school_id: schoolId }));

  const { data, error } = await supabase
    .from('students')
    .insert(rows)
    .select();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/students');
  return data;
}
