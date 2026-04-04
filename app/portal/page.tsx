import { createClient } from '@/lib/supabase/server';
import { Form } from '@/types/database';
import { FileText, ArrowRight, Printer, Sparkles, UploadCloud, Edit3, Search } from 'lucide-react';
import Link from 'next/link';
import ClientHistory from '@/components/portal/ClientHistory';

export const revalidate = 0;

export default async function PortalPage() {
  const supabase = await createClient();

  // Fetch all public forms
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  const formIds = forms?.map(f => f.id) || [];

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      <div className="rounded-[32px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-10 shadow-sm relative overflow-hidden">
        <Sparkles className="absolute right-8 top-8 text-indigo-400/20 w-24 h-24" />
        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">GPRS Client Portal</h1>
          <p className="max-w-2xl text-slate-500 font-medium leading-relaxed">
            Welcome to the official data submission gateway for Grand Printing Reliable Solutions. 
            Securely upload institutional records for professional printing processing.
          </p>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-black text-sm">1</div>
            <h3 className="font-bold text-slate-900">Enter Your Organization Name</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Type your institution name exactly as it was registered. Autocomplete will suggest matches if you have submitted before.</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-black text-sm">2</div>
            <h3 className="font-bold text-slate-900">Choose a Form Type</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Select the data request you need to fulfill from the active forms below. Each form collects different types of institutional records.</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-black text-sm">3</div>
            <h3 className="font-bold text-slate-900">Upload or Fill Manually</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Upload a CSV/Excel file for bulk data or fill the form entry by entry. Track your submissions using your organization name.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
           <FileText className="w-5 h-5 text-indigo-500" />
           <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Data Requests</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {forms && forms.map((form) => (
            <Link
              key={form.id}
              href={`/f/${form.share_url_id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-50/50 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{form.title}</h3>
                {form.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500 font-medium leading-relaxed">{form.description}</p>
                )}
              </div>

              <div className="relative mt-8 flex items-center gap-2 text-xs font-black tracking-widest uppercase text-indigo-600 transition-all group-hover:gap-3">
                Start Submission
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}

          {(!forms || forms.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 py-24 bg-white/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Printer className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">Queue is empty</h3>
              <p className="mt-1 text-sm text-slate-400 font-medium">
                GPRS has not published any active data requests at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      <ClientHistory formIds={formIds} />
    </div>
  );
}
