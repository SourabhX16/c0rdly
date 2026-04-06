import NewOrgClient from './NewOrgClient';
import ContactWidget from '@/components/client/ContactWidget';

export default function NewOrgPage() {
  return (
    <div className="bg-cosmic-navy min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-[720px] w-full space-y-6">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="gradient-indigo-bar h-2" />
          <div className="bg-midnight-panel border border-white/[0.06] border-t-0 rounded-b-2xl p-6 sm:p-8">
            <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">
              Generate New Organization ID
            </h1>
            <p className="mt-2 text-sm text-frost-gray leading-relaxed max-w-lg">
              Register your organization to receive a unique ID for tracking all your submissions.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                GPRS Registration
              </span>
            </div>
          </div>
        </div>

        <NewOrgClient />

        <ContactWidget compact />
      </div>
    </div>
  );
}
