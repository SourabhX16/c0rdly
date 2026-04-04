import { getFormById } from '@/actions/forms';
import { getFormOrganizationsAction } from '@/app/actions/form';
import { notFound } from 'next/navigation';
import FormResponsesClient from './FormResponsesClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormResponsesPage({ params }: PageProps) {
  const { id } = await params;
  
  const form = await getFormById(id);
  if (!form) {
    return notFound();
  }

  const organizations = await getFormOrganizationsAction(form.id);

  return <FormResponsesClient form={form} organizations={organizations} />;
}
