import { getFormByShareIdAction } from '@/app/actions/form';
import { notFound } from 'next/navigation';
import PublicFormClient from '@/components/public/PublicFormClient';
import ContactWidget from '@/components/client/ContactWidget';

export default async function PublicFormPage({ params }: { params: { shareId: string } }) {
  const resolvedParams = await params;

  const form = await getFormByShareIdAction(resolvedParams.shareId);

  if (!form) {
    notFound();
  }

  return (
    <div className="light-form-container min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-[720px] w-full space-y-6">
        {/* Gradient Header Bar */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="gradient-indigo-bar h-2" />
          <div className="bg-white border border-slate-200 border-t-0 rounded-b-2xl p-6 sm:p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-lg">
                {form.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                GPRS Data Collection
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <PublicFormClient form={form} />

        {/* Contact Widget */}
        <ContactWidget compact />
      </div>
    </div>
  );
}
