'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ACADEMIC_SESSIONS, DEFAULT_SESSION } from '@/lib/constants';

export function useSession() {
  const searchParams = useSearchParams();
  return searchParams.get('session') || DEFAULT_SESSION;
}

export default function SessionSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSession = searchParams.get('session') || DEFAULT_SESSION;

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('session', value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-surface-400" />
      <select
        id="session-selector"
        value={currentSession}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 outline-none transition-all hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      >
        {ACADEMIC_SESSIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
