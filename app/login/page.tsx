'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Printer, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [schoolName, setSchoolName] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id, role: 'school',
            school_name: schoolName || null, contact_email: email,
          });
        }
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-800 to-surface-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">c0rdly</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">Report cards that look exactly like your prints.</h2>
          <p className="mt-4 text-primary-200">Schools upload data, admins generate pixel-perfect PDFs.</p>
        </div>
        <p className="text-sm text-primary-300">© {new Date().getFullYear()} c0rdly</p>
      </div>

      <div className="flex w-full items-center justify-center bg-surface-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">c0rdly</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-surface-500">{mode === 'login' ? 'Sign in to your dashboard' : 'Register your school'}</p>

          {error && <div className="mt-4 rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="school-name" className="mb-1.5 block text-sm font-medium text-surface-700">School Name</label>
                <input id="school-name" type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Sunrise Public School" required
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-surface-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.in" required
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-surface-700">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="font-semibold text-primary-600 hover:text-primary-700">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
