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
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Navigate to admin
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">GPRS</span>
        </div>
        <div className="max-w-md animate-slide-up">
          <h2 className="text-4xl font-bold leading-tight text-white mb-4">Admin Portal</h2>
          <p className="text-indigo-200">Manage data requests, forms, and incoming submissions for the press.</p>
        </div>
        <p className="text-sm text-indigo-300 font-medium tracking-wide">GRAND PRINTING ® {new Date().getFullYear()}</p>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">GPRS</span>
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">GPRS Admin Login</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">Restricted access for GPRS staff only</p>
          </div>

          {error && <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gprs.com" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
               &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
