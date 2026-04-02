import { createClient } from '@/lib/supabase/server';
import { School, Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOverview() {
  const supabase = await createClient();

  const { count: schoolCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'school');

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  const { count: reportCount } = await supabase
    .from('report_cards')
    .select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Schools', value: schoolCount || 0, icon: School, color: 'bg-primary-500', href: '/admin/schools' },
    { label: 'Total Students', value: studentCount || 0, icon: Users, color: 'bg-accent-500', href: '/admin/schools' },
    { label: 'Report Cards', value: reportCount || 0, icon: FileText, color: 'bg-warning-500', href: '/admin/print-jobs' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-surface-500">Manage all schools and print jobs</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="group rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-surface-900">{s.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color} shadow-lg`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
