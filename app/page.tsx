import Link from 'next/link';
import {
  Printer, Upload, FileText, ArrowRight, Shield, Zap, Users,
  CheckCircle2, ChevronRight, BarChart3, Download, Sparkles,
  Phone, Mail, MapPin,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cosmic-navy">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-white/[0.06] bg-deep-abyss/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-primary shadow-lg shadow-indigo-primary/30">
            <Printer className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-white">GPRS</span>
            <p className="text-[10px] text-indigo-400 font-bold -mt-1 tracking-widest uppercase">Reliable Solutions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-frost-gray hover:text-slate-white transition-colors duration-150"
          >
            Client Portal
          </Link>
          <Link
            href="/login"
            className="btn-primary text-sm"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center lg:pt-28">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reliable Printing Solutions for Institutions
          </div>
          <h1 className="font-display mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-white sm:text-5xl lg:text-7xl">
            Grand Printing <br/>
            <span className="gradient-text">Reliable Solutions.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-frost-gray">
            Automating data collection for professional printing. From Marksheets and ID Cards
            to bulk document processing — we digitise your workflow for pixel-perfect results.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/portal"
              className="btn-primary flex items-center gap-2 px-8 py-4 text-sm"
            >
              <Users className="h-4 w-4" strokeWidth={1.5} />
              Client Portal
            </Link>
            <a
              href="tel:8819959931"
              className="btn-secondary flex items-center gap-2 px-8 py-4 text-sm"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              Call 8819959931
            </a>
          </div>
        </div>
      </section>

      {/* Contact Quick Strip */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16 text-sm">
          <div className="flex items-center gap-2 text-frost-gray">
            <Mail className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
            grandprintingsolution@gmail.com
          </div>
          <div className="flex items-center gap-2 text-frost-gray">
            <Phone className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
            +91 8819959931
          </div>
          <div className="flex items-center gap-2 text-frost-gray">
            <MapPin className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
            GPRS Printing Press, India
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-slate-white sm:text-5xl tracking-tight">
            Our specialised services
          </h2>
          <p className="mt-4 text-frost-gray max-w-xl mx-auto leading-relaxed">
            We handle the technical heavy lifting so your institution can focus on results.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 stagger-children">
          {[
            {
              icon: FileText,
              title: 'Marksheet Printing',
              desc: 'High-security marksheets with pixel-perfect data mapping. Upload your data once, print for the entire session.',
            },
            {
              icon: Users,
              title: 'Institutional ID Cards',
              desc: 'Bulk ID card generation for students and staff. Direct photo upload and auto-formatting for thermal printing.',
            },
            {
              icon: Zap,
              title: 'Data Digitisation',
              desc: 'Convert physical records into structured digital data. Perfect for archival or bulk document processing.',
            },
          ].map((item, i) => (
            <div key={i} className="crystal-card p-8 group">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 transition-all duration-200 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/20">
                <item.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display mb-3 text-xl font-semibold text-slate-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-frost-gray">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="glass-card-elevated p-10 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-white sm:text-4xl mb-8 tracking-tight">
                How we work
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Create a Data Request', desc: 'We build a custom form tailored to your institution\u2019s printing requirements.' },
                  { title: 'Upload Bulk Data', desc: 'Clients upload spreadsheets or fill forms online. Our system auto-validates every field.' },
                  { title: 'Professional Printing', desc: 'Once data is verified, our press begins high-quality printing with zero manual errors.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-primary text-sm font-bold text-white shadow-lg shadow-indigo-primary/20">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-slate-white text-lg">{item.title}</h4>
                      <p className="text-frost-gray text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block relative lg:h-[400px] rounded-2xl overflow-hidden border border-white/[0.06] bg-midnight-panel">
              <div className="absolute inset-0 bg-indigo-500/5" />
              <div className="p-8 space-y-4">
                <div className="h-4 w-3/4 bg-white/[0.04] rounded-full" />
                <div className="h-4 w-1/2 bg-white/[0.04] rounded-full" />
                <div className="h-24 w-full bg-white/[0.04] rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-12 bg-indigo-500/10 rounded-xl" />
                  <div className="h-12 bg-indigo-500/10 rounded-xl" />
                  <div className="h-12 bg-indigo-500/10 rounded-xl" />
                </div>
                <div className="h-4 w-2/3 bg-white/[0.04] rounded-full" />
                <div className="h-10 w-full bg-indigo-primary/20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 text-dim-steel bg-deep-abyss">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/10">
                  <Printer className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-bold text-slate-white tracking-tight">GPRS</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                Grand Printing Reliable Solutions. Leading institutional printing with digital efficiency.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div>
                <h4 className="font-display text-slate-white font-semibold mb-4 text-sm">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>8819959931</li>
                  <li className="break-all">grandprintingsolution@gmail.com</li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-slate-white font-semibold mb-4 text-sm">Portal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/login" className="hover:text-indigo-400 transition-colors duration-150">Admin Access</Link></li>
                  <li><Link href="/portal" className="hover:text-indigo-400 transition-colors duration-150">Client Portal</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.06] text-center text-xs text-dim-steel">
            &copy; {new Date().getFullYear()} GRAND PRINTING RELIABLE SOLUTIONS (GPRS). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
