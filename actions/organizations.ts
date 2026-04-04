'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';

export async function getOrganizations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createOrganization(data: {
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Not authenticated');
  }

  const { data: newOrg, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      contact_email: data.contact_email || null,
      phone: data.phone || null,
      address: data.address || null,
      logo_url: data.logo_url || null,
      created_by: userData.user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logAuditAction('org_created', 'organization', newOrg.id, { name: data.name });
  revalidatePath('/admin/organizations');
  return newOrg;
}

export async function updateOrganization(id: string, data: {
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      contact_email: data.contact_email || null,
      phone: data.phone || null,
      address: data.address || null,
      logo_url: data.logo_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  await logAuditAction('org_updated', 'organization', id, { name: data.name });
  revalidatePath('/admin/organizations');
}

export async function deleteOrganization(id: string) {
  const supabase = await createClient();

  await logAuditAction('org_deleted', 'organization', id, { id });

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/organizations');
}
