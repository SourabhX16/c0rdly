import { createClient } from '@/lib/supabase/server';
import StudentsTable from '@/components/dashboard/StudentsTable';
import ExportExcel from '@/components/dashboard/ExportExcel';

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from('students')
    .select('*, report_cards(*)')
    .eq('school_id', user!.id)
    .order('name');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
          <p className="mt-1 text-sm text-surface-500">Manage all student records and report cards</p>
        </div>
        <ExportExcel schoolId={user!.id} />
      </div>
      <StudentsTable students={students || []} />
    </div>
  );
}
