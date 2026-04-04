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

  const isActive = (href: string) =>
    href === '/portal' ? pathname === '/portal' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-deep-abyss px-4 py-3 lg:hidden">
        <Link href="/portal" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
            <Printer className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-sm font-bold text-slate-white tracking-tight">
            GPRS
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-frost-gray hover:bg-white/5 hover:text-slate-white transition-all duration-150"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-deep-abyss border-r border-white/[0.06] transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Area */}
        <div className="flex items-center gap-3 px-6 py-6">
          <Link href="/portal" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
              <Printer className="h-5 w-5 text-white" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-xl ring-2 ring-indigo-primary/20 animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-slate-white tracking-tight">GPRS</p>
              <p className="text-[11px] text-indigo-400 font-medium">Client Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-2">
          <nav className="space-y-1">
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
                      'h-[18px] w-[18px] transition-colors duration-150',
                      active ? 'text-indigo-400' : 'text-dim-steel group-hover:text-frost-gray'
                    )}
                    strokeWidth={1.5}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Indigo Gradient Contact Widget */}
          <div className="mt-6 mb-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white border border-indigo-500/20">
            <h4 className="mb-2 font-display text-sm font-bold tracking-tight">Need Assistance?</h4>
            <p className="mb-4 text-[13px] font-medium text-indigo-200 leading-relaxed">
              If you have any questions regarding your data submission, our team is here to help.
            </p>
            <div className="space-y-2">
              <a
                href="tel:8819959931"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold transition-all duration-150 hover:bg-white/20"
              >
                <Phone className="h-3.5 w-3.5 text-indigo-200" strokeWidth={1.5} />
                8819959931
              </a>
              <a
                href="mailto:grandprintingsolution@gmail.com"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold transition-all duration-150 hover:bg-white/20 break-all"
              >
                <Mail className="h-3.5 w-3.5 text-indigo-200 shrink-0" strokeWidth={1.5} />
                grandprintingsolution@gmail.com
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
