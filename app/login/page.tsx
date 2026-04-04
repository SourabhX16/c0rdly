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
      {/* Left Panel — Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-deep-abyss p-12 lg:flex border-r border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
            <Printer className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-white">GPRS</span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight text-slate-white mb-4 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-frost-gray leading-relaxed">
            Manage data requests, forms, and incoming submissions for the press.
          </p>
        </div>
        <p className="text-sm text-dim-steel font-medium tracking-wide">
          GRAND PRINTING &reg; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full items-center justify-center bg-cosmic-navy px-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
              <Printer className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-white">GPRS</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-white tracking-tight">
              GPRS Admin Login
            </h1>
            <p className="mt-2 text-sm text-dim-steel font-medium">
              Restricted access for GPRS staff only
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-frost-gray">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gprs.com"
                required
                autoComplete="email"
                className="input-dark w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-frost-gray">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="input-dark w-full pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-steel hover:text-frost-gray transition-colors duration-150"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-150">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
