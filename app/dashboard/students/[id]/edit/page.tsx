import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import StudentForm from '@/components/dashboard/StudentForm';
import SinglePdfDownload from '@/components/dashboard/SinglePdfDownload';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (!student) notFound();

  const { data: reportCard } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Edit Student</h1>
          <p className="mt-1 text-sm text-surface-500">{student.name} — Class {student.class}</p>
        </div>
        <SinglePdfDownload studentId={id} />
      </div>
      <StudentForm schoolId={user!.id} student={student} reportCard={reportCard} />
    </div>
  );
}
