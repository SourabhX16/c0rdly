import { createClient } from '@/lib/supabase/server';
import { Users, FileText, Upload, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_SESSION } from '@/lib/constants';

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionParam } = await searchParams;
  const session = sessionParam || DEFAULT_SESSION;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', user!.id);

  const { count: reportCount } = await supabase
    .from('report_cards')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', user!.id)
    .eq('session', session);

  const stats = [
    { label: 'Total Students', value: studentCount || 0, icon: Users, color: 'bg-primary-500', href: '/dashboard/students' },
    { label: `Reports (${session})`, value: reportCount || 0, icon: FileText, color: 'bg-accent-500', href: '/dashboard/students' },
    { label: 'Bulk Upload', value: 'CSV', icon: Upload, color: 'bg-warning-500', href: '/dashboard/upload' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-sm text-surface-500">Manage your students and report cards</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-surface-900">{s.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color} shadow-lg`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-surface-300 transition-all group-hover:text-primary-500" />
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/students/new"
            className="flex items-center gap-3 rounded-xl border border-surface-200 p-4 transition-all hover:border-primary-200 hover:bg-primary-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">Add Student</p>
              <p className="text-xs text-surface-500">Create a new student record</p>
            </div>
          </Link>
          <Link href="/dashboard/upload"
            className="flex items-center gap-3 rounded-xl border border-surface-200 p-4 transition-all hover:border-accent-200 hover:bg-accent-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">Bulk Upload</p>
              <p className="text-xs text-surface-500">Upload students via CSV</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
