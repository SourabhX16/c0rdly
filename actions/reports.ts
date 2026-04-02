'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ReportCardFormData } from '@/types/database';

export async function getReportCard(studentId: string, session?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', studentId);

  if (session) query = query.eq('session', session);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertReportCard(
  studentId: string,
  schoolId: string,
  formData: ReportCardFormData
) {
  const supabase = await createClient();

  // Check if report card exists for this student+session
  const { data: existing } = await supabase
    .from('report_cards')
    .select('id')
    .eq('student_id', studentId)
    .eq('session', formData.session)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('report_cards')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/students');
    return data;
  } else {
    const { data, error } = await supabase
      .from('report_cards')
      .insert({
        student_id: studentId,
        school_id: schoolId,
        ...formData,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/students');
    return data;
  }
}

export async function getStudentsWithReports(filters?: {
  schoolId?: string;
  className?: string;
  session?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('students')
    .select('*, report_cards(*), school:profiles!students_school_id_fkey(school_name)')
    .order('class')
    .order('name');

  if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
  if (filters?.className) query = query.eq('class', filters.className);
  if (filters?.session) query = query.eq('report_cards.session', filters.session);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllSchools() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'school')
    .order('school_name');

  if (error) throw new Error(error.message);
  return data;
}
