import { getFormByShareIdAction } from '@/app/actions/form';
import { notFound } from 'next/navigation';
import PublicFormClient from '@/components/public/PublicFormClient';

export default async function PublicFormPage({ params }: { params: { shareId: string } }) {
  // We need to resolve params in Next 15 if applicable, but standard Next Router provides params synchronously
  // Wait, in Next 15 `params` is a Promise, so we might need to await it. Let's just await it to be safe.
  const resolvedParams = await params;
  
  const form = await getFormByShareIdAction(resolvedParams.shareId);

  if (!form) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <PublicFormClient form={form} />
      </div>
    </div>
  );
}
