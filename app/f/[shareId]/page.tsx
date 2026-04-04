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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        <PublicFormClient form={form} />
        <ContactWidget compact />
      </div>
    </div>
  );
}
