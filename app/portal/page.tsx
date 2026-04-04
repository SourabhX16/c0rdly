import { createClient } from '@/lib/supabase/server';
import { Form } from '@/types/database';
import { FileText, ArrowRight, Printer, UploadCloud, Edit3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ClientHistory from '@/components/portal/ClientHistory';

export const revalidate = 0;

export default async function PortalPage() {
  const supabase = await createClient();

  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  const formIds = forms?.map(f => f.id) || [];

  const steps = [
    {
      num: 1,
      icon: Edit3,
      title: 'Enter Your Organization Name',
      description: 'Type your institution name exactly as it was registered. Autocomplete will suggest matches if you have submitted before.',
    },
    {
      num: 2,
      icon: FileText,
      title: 'Choose a Form Type',
      description: 'Select the data request you need to fulfill from the active forms below. Each form collects different types of institutional records.',
    },
    {
      num: 3,
      icon: UploadCloud,
      title: 'Upload or Fill Manually',
      description: 'Upload a CSV/Excel file for bulk data or fill the form entry by entry. Track your submissions using your organization name.',
    },
  ];

  return (
    <div className="animate-fade-in space-y-10 max-w-5xl mx-auto">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="gradient-indigo-bar h-1.5" />
        <div className="bg-midnight-panel p-8 sm:p-10 relative">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="relative">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-white tracking-tight">
              GPRS Client Portal
            </h1>
            <p className="mt-3 max-w-2xl text-frost-gray leading-relaxed">
              Welcome to the official data submission gateway for Grand Printing Reliable Solutions.
              Securely upload institutional records for professional printing processing.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="glass-card-elevated p-8">
        <h2 className="font-display text-lg font-semibold text-slate-white tracking-tight mb-6">
          How It Works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/10">
                  <span className="font-display text-sm font-bold text-indigo-400">{step.num}</span>
                </div>
                <step.icon className="w-5 h-5 text-frost-gray" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-sm font-semibold text-slate-white">
                {step.title}
              </h3>
              <p className="text-sm text-dim-steel leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Data Requests */}
      <section>
        <div className="flex items-center gap-3 mb-6 px-1">
          <FileText className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-semibold text-slate-white tracking-tight">
            Active Data Requests
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 stagger-children">
          {forms && forms.map((form) => (
            <Link
              key={form.id}
              href={`/f/${form.share_url_id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.06] bg-midnight-panel p-7 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              {/* Glow orb */}
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 group-hover:scale-150 transition-all duration-500" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/10 text-indigo-400 transition-all duration-200 group-hover:bg-indigo-primary group-hover:text-white group-hover:rotate-6 group-hover:border-indigo-primary">
                  <FileText className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-white line-clamp-1 group-hover:text-indigo-400 transition-colors duration-150 uppercase tracking-wide">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="mt-2.5 line-clamp-2 text-sm text-dim-steel leading-relaxed">
                    {form.description}
                  </p>
                )}
              </div>

              <div className="relative mt-7 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-indigo-400 transition-all duration-150 group-hover:gap-3">
                Start Submission
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" strokeWidth={2} />
              </div>
            </Link>
          ))}

          {(!forms || forms.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.08] py-20 bg-white/[0.02]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <Printer className="h-7 w-7 text-dim-steel" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold text-slate-white">
                Queue is empty
              </h3>
              <p className="mt-1.5 text-sm text-dim-steel">
                GPRS has not published any active data requests at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Client submission history */}
      <ClientHistory formIds={formIds} />
    </div>
  );
}
