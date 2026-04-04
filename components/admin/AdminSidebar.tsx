'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard,
  Printer,
  LogOut,
  Menu,
  X,
  ClipboardList,
  FileSearch,
  Building2,
} from 'lucide-react';
import { signOut } from '@/actions/auth';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/forms', label: 'Data Request Forms', icon: Printer },
  { href: '/admin/submissions', label: 'Submissions', icon: ClipboardList },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/audit', label: 'Audit Log', icon: FileSearch },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-deep-abyss px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
            <Printer className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-sm font-bold text-slate-white tracking-tight">
            GPRS
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-frost-gray hover:bg-white/5 hover:text-slate-white transition-all duration-150"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-deep-abyss transition-transform duration-300 lg:static lg:translate-x-0',
          'border-r border-white/[0.06]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
            <Printer className="h-5 w-5 text-white" strokeWidth={1.5} />
            {/* Indigo glow ring */}
            <div className="absolute inset-0 rounded-xl ring-2 ring-indigo-primary/20 animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-slate-white tracking-tight">
              GPRS
            </p>
            <p className="text-[11px] text-dim-steel font-medium">
              Press Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'nav-active'
                    : 'text-frost-gray hover:bg-white/[0.04] hover:text-slate-white'
                )}
              >
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
                    active ? 'text-indigo-400' : 'text-dim-steel group-hover:text-frost-gray'
                  )}
                  strokeWidth={1.5}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dim-steel transition-all duration-150 hover:bg-red-500/[0.08] hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
