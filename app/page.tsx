import Link from 'next/link';
import {
  GraduationCap, Printer, Upload, FileText, ArrowRight, Shield, Zap, Users,
  CheckCircle2, ChevronRight, BarChart3, Download, Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-primary-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-lg shadow-primary-500/30">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">c0rdly</span>
        </div>
        <Link href="/login" className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center lg:pt-28">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-1.5 text-sm font-medium text-primary-300">
            <Zap className="h-3.5 w-3.5" />
            Built for Indian Schools &amp; Printing Presses
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Report Card Printing,{' '}
            <span className="gradient-text">Simplified.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-300">
            Bulk upload student data, auto-generate pixel-perfect CBSE &amp; State Board
            report cards, and download print-ready PDFs in minutes — not days.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login" className="group flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:shadow-primary-500/40">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/login" className="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {[
            { value: '500+', label: 'Students Managed', icon: Users },
            { value: '1,200+', label: 'PDFs Generated', icon: FileText },
            { value: '15+', label: 'Schools Onboarded', icon: GraduationCap },
            { value: '99.9%', label: 'Print Accuracy', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/20">
                <s.icon className="h-5 w-5 text-primary-400" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-surface-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
            <Sparkles className="h-3 w-3" /> How It Works
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Three steps to print-ready reports</h2>
          <p className="mt-3 text-surface-400">From data entry to printed report cards in under 10 minutes.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: '01',
              icon: Upload,
              title: 'Upload Student Data',
              desc: 'Enter students one-by-one or bulk upload via CSV. Data is validated and stored securely with school-level isolation.',
            },
            {
              step: '02',
              icon: BarChart3,
              title: 'Fill Marks & Grades',
              desc: 'Use the 4-step stepper form to enter scholastic marks, co-scholastic grades, personal qualities, and attendance.',
            },
            {
              step: '03',
              icon: Download,
              title: 'Generate & Download',
              desc: 'Preview individual PDFs or batch-generate for your entire school. Download as a ZIP file ready for the press.',
            },
          ].map((item, i) => (
            <div key={i} className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-primary-500/40 hover:bg-white/10">
              <span className="absolute -top-4 left-6 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-primary-500/30">
                {item.step}
              </span>
              <div className="mb-5 mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 transition-colors group-hover:bg-primary-500/30">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-surface-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need</h2>
          <p className="mt-3 text-surface-400">Purpose-built for the Indian school report card workflow.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Upload, title: 'Bulk CSV Upload', desc: 'Upload hundreds of students at once via CSV. Auto-validates and maps to your report card format.' },
            { icon: FileText, title: 'Pixel-Perfect PDFs', desc: 'Generate report cards that match your physical print layout exactly. CBSE & State Board formats.' },
            { icon: GraduationCap, title: 'Dynamic Subjects', desc: 'Subjects auto-adjust per class. Add or remove subjects as needed — stored as flexible JSONB.' },
            { icon: Shield, title: 'School Isolation', desc: 'Row-Level Security ensures each school sees only their own data. Admin sees everything.' },
            { icon: Users, title: 'Multi-School Admin', desc: 'Printing press admin dashboard to manage all schools, filter by class, and batch-generate PDFs.' },
            { icon: Zap, title: 'Free-Tier Friendly', desc: 'Runs on Vercel + Supabase free tiers. No monthly costs until you scale.' },
          ].map((f, i) => (
            <div key={i} className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-primary-500/40 hover:bg-white/10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 transition-colors group-hover:bg-primary-500/30">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-surface-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-gradient-to-r from-primary-900/50 to-primary-800/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-20">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to streamline your report cards?
          </h2>
          <p className="mt-4 text-surface-300">
            Join schools across India already saving hours on report card generation.
            Free to start, no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-surface-900 shadow-xl transition-all hover:bg-surface-100">
              Create Free Account
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs text-surface-500">No credit card required • Free forever plan</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-surface-500">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500/20">
                <Printer className="h-3.5 w-3.5 text-primary-400" />
              </div>
              <span className="text-sm font-semibold text-surface-400">c0rdly</span>
            </div>
            <p>© {new Date().getFullYear()} c0rdly. Built for Indian printing presses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
