import { createClient } from '@/lib/supabase/server';
import StudentForm from '@/components/dashboard/StudentForm';

export default async function NewStudentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Add New Student</h1>
        <p className="mt-1 text-sm text-surface-500">Fill in student profile and report card data</p>
      </div>
      <StudentForm schoolId={user!.id} />
    </div>
  );
}
