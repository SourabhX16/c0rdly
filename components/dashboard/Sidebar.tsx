'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Upload, LogOut, Printer, Menu, X, ChevronRight, Settings,
} from 'lucide-react';
import { signOut } from '@/actions/auth';
import SessionSelector from '@/components/SessionSelector';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/upload', label: 'Bulk Upload', icon: Upload },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ schoolName }: { schoolName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Printer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">c0rdly</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-surface-600">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-surface-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 border-b border-surface-100 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-md shadow-primary-500/20">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900">c0rdly</p>
            <p className="text-xs text-surface-500 truncate max-w-[140px]">{schoolName || 'School Portal'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              )}>
              <item.icon className={cn('h-4.5 w-4.5', isActive(item.href) ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600')} />
              {item.label}
              {isActive(item.href) && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary-400" />}
            </Link>
          ))}
        </nav>

        {/* Session Selector */}
        <div className="border-t border-surface-100 px-4 py-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-surface-400">Academic Session</p>
          <Suspense fallback={<div className="h-8 skeleton" />}>
            <SessionSelector />
          </Suspense>
        </div>

        <div className="border-t border-surface-100 p-3">
          <button onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-danger-500/10 hover:text-danger-600">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
