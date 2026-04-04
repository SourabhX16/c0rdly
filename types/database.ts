// ============================================================
// GPRS – Database Type Definitions
// ============================================================

export type UserRole = 'admin';

// ---------- profiles ----------
export interface Profile {
  id: string;
  role: UserRole;
  organization_name: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
}

// ---------- Dynamic Forms ----------
export type FormFieldType = 'text' | 'number' | 'select' | 'date' | 'file';

export interface FormField {
  id: string;
  name: string; // The key used in JSON data (e.g., 'student_name')
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  fields: FormField[];
  share_url_id: string;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  org_name: string;
  data: Record<string, any>;
  raw_file_path: string | null;
  status: string; // e.g., 'Received', 'In Progress', 'Done'
  created_at: string;
}

// ---------- Audit Logs ----------
export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any> | null;
  created_at: string;
}

// ---------- Organizations ----------
export interface Organization {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
