import { createClient } from '@/lib/supabase/server';

type AuditAction =
  | 'form_created'
  | 'form_updated'
  | 'form_deleted'
  | 'status_changed'
  | 'submission_deleted'
  | 'org_created'
  | 'org_updated'
  | 'org_deleted';

type AuditTargetType = 'form' | 'submission' | 'organization';

export async function logAuditAction(
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert({
      admin_id: userData?.user?.id || null,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || null,
    });
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}

export async function getAuditLogsAction(params?: {
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('audit_logs')
    .select('*, profiles!audit_logs_admin_id_fkey(organization_name, contact_email)');

  if (params?.actionType && params.actionType !== 'All') {
    query = query.eq('action', params.actionType);
  }

  if (params?.dateFrom) {
    query = query.gte('created_at', params.dateFrom);
  }

  if (params?.dateTo) {
    query = query.lte('created_at', params.dateTo);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch audit logs error:', error);
    return [];
  }

  return data || [];
}
