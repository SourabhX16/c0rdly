'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Printer, Menu, X, FileText, Phone, Mail } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'Available Forms', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Consider it active if it's the exact path or starts with it (for nested form views)
  const isActive = (href: string) =>
    href === '/portal' ? pathname === '/portal' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-indigo-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
            <Printer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">GPRS</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="text-slate-500 hover:text-indigo-600 transition-colors">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl shadow-slate-200/50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Area */}
        <div className="flex items-center gap-3 border-b border-indigo-50 px-6 py-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 tracking-tight">GPRS</p>
              <p className="text-xs font-semibold text-indigo-500">Client Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation Area */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Quick Contact Widget */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 text-white shadow-lg shadow-indigo-500/20">
            <h4 className="mb-2 text-sm font-bold tracking-tight">Need Assistant?</h4>
            <p className="mb-4 text-[13px] font-medium text-indigo-100 leading-relaxed">
              If you have any questions regarding your data submission, our team is here to help.
            </p>
            <div className="space-y-3">
              <a href="tel:8819959931" className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/20">
                <Phone className="h-3.5 w-3.5 text-indigo-200" />
                8819959931
              </a>
              <a href="mailto:grandprintingsolution@gmail.com" className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/20 break-all">
                <Mail className="h-3.5 w-3.5 text-indigo-200 shrink-0" />
                grandprintingsolution@gmail.com
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
