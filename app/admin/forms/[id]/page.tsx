import { getFormById } from '@/actions/forms';
import FormBuilder from '@/components/admin/FormBuilder';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormEditorPage({ params }: PageProps) {
  const { id } = await params;
  
  let initialData = null;
  if (id !== 'new') {
    initialData = await getFormById(id);
    if (!initialData) {
      return notFound();
    }
  }

  return (
    <div className="py-8">
      <FormBuilder initialData={initialData} />
    </div>
  );
}
