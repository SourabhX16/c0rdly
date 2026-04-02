import { createClient } from '@/lib/supabase/server';
import { School, Users } from 'lucide-react';

export default async function AdminSchoolsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'school')
    .order('school_name');

  // Get student counts per school
  const schoolsWithCounts = await Promise.all(
    (schools || []).map(async (school) => {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school.id);
      return { ...school, student_count: count || 0 };
    })
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Schools</h1>
        <p className="mt-1 text-sm text-surface-500">All registered schools on the platform</p>
      </div>

      {schoolsWithCounts.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center shadow-sm">
          <School className="mx-auto h-10 w-10 text-surface-300" />
          <p className="mt-3 text-sm text-surface-500">No schools registered yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schoolsWithCounts.map((school) => (
            <div key={school.id}
              className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <School className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 truncate">{school.school_name || 'Unnamed School'}</h3>
                  <p className="text-xs text-surface-500 truncate">{school.contact_email}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm text-surface-600">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">{school.student_count}</span> students
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
