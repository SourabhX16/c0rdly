import Link from 'next/link';
import {
  Printer, Upload, FileText, ArrowRight, Shield, Zap, Users,
  CheckCircle2, ChevronRight, BarChart3, Download, Sparkles,
  Phone, Mail, MapPin, 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <div>
             <span className="text-xl font-bold tracking-tight text-white">GPRS</span>
             <p className="text-[10px] text-indigo-400 font-bold -mt-1 tracking-widest uppercase">Reliable Solutions</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center lg:pt-28">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Reliable Printing Solutions for Institutions
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            Grand Printing <br/>
            <span className="text-indigo-400 italic">Reliable Solutions.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Automating data collection for professional printing. From Marksheets and ID Cards 
            to bulk document processing — we digitise your workflow for pixel-perfect results.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/portal" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5">
              <Users className="h-4 w-4" />
              Client Portal
            </Link>
            <a href="tel:8819959931" className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:-translate-y-0.5">
              <Phone className="h-4 w-4" />
              Call 8819959931
            </a>
          </div>
        </div>
      </section>

      {/* Contact Quick Strip */}
      <section className="bg-indigo-600/5 border-y border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap justify-center gap-8 md:gap-16 text-sm">
           <div className="flex items-center gap-2 text-slate-300">
             <Mail className="h-4 w-4 text-indigo-400" />
             grandprintingsolution@gmail.com
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <Phone className="h-4 w-4 text-indigo-400" />
             +91 8819959931
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <MapPin className="h-4 w-4 text-indigo-400" />
             GPRS Printing Press, India
           </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">Our specialised services</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">We handle the technical heavy lifting so your institution can focus on results.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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
            <div key={i} className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-indigo-500/30">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-6xl px-6 py-20 bg-indigo-600/5 rounded-[40px] border border-white/5 mb-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">How we work</h2>
            <div className="space-y-8">
              {[
                { title: 'Create a Data Request', desc: 'We build a custom form tailored to your institution’s printing requirements.' },
                { title: 'Upload Bulk Data', desc: 'Clients upload spreadsheets or fill forms online. Our system auto-validates every field.' },
                { title: 'Professional Printing', desc: 'Once data is verified, our press begins high-quality printing with zero manual errors.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative lg:h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 bg-indigo-500/10"></div>
              <div className="p-8 space-y-4">
                  <div className="h-4 w-3/4 bg-white/5 rounded-full"></div>
                  <div className="h-4 w-1/2 bg-white/5 rounded-full"></div>
                  <div className="h-24 w-full bg-white/5 rounded-2xl"></div>
                  <div className="grid grid-cols-3 gap-3">
                      <div className="h-12 bg-indigo-500/20 rounded-xl"></div>
                      <div className="h-12 bg-indigo-500/20 rounded-xl"></div>
                      <div className="h-12 bg-indigo-500/20 rounded-xl"></div>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-slate-500 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Printer className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">GPRS</span>
              </div>
              <p className="max-w-xs text-sm">Grand Printing Reliable Solutions. Leading institutional printing with digital efficiency.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div>
                <h4 className="text-white font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>8819959931</li>
                  <li className="break-all">grandprintingsolution@gmail.com</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Portal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/login" className="hover:text-white transition-colors">Admin Access</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
            © {new Date().getFullYear()} GRAND PRINTING RELIABLE SOLUTIONS (GPRS). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
