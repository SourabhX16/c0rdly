'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
  organization_name?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      organization_name: data.organization_name || null,
      contact_email: data.contact_email || null,
      phone: data.phone || null,
      address: data.address || null,
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function updateLogoUrl(logoUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ logo_url: logoUrl })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}
