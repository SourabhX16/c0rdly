// ============================================================
// c0rdly – Database Type Definitions
// ============================================================

export type UserRole = 'admin' | 'school';

// ---------- profiles ----------
export interface Profile {
  id: string;
  role: UserRole;
  school_name: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
}

// ---------- students ----------
export interface Student {
  id: string;
  school_id: string;
  name: string;
  scholar_no: string;
  roll_no: string;
  sssm_id: string | null;
  family_id: string | null;
  aadhar_no: string | null;
  dob: string;
  class: string;
  section: string | null;
  medium: string;
  father_name: string;
  mother_name: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- JSONB sub-types for report_cards ----------
export interface SubjectMarks {
  subject: string;
  monthly_test: number | null;
  half_yearly: number | null;
  project: number | null;
  annual: number | null;
  total: number | null;
  grade: string | null;
}

export interface CoScholasticEntry {
  area: string;
  grade: string;
}

export interface PersonalQuality {
  quality: string;
  grade: string;
}

export interface AttendanceData {
  total_days: number;
  present_days: number;
  percentage: number;
}

// ---------- report_cards ----------
export interface ReportCard {
  id: string;
  student_id: string;
  school_id: string;
  session: string;
  scholastic_data: SubjectMarks[];
  co_scholastic_data: CoScholasticEntry[];
  personal_qualities: PersonalQuality[];
  attendance: AttendanceData;
  teacher_remarks: string | null;
  promoted_to: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Joined views ----------
export interface StudentWithReport extends Student {
  report_cards: ReportCard[];
  school?: Profile;
}

// ---------- Form input types ----------
export interface StudentFormData {
  name: string;
  scholar_no: string;
  roll_no: string;
  sssm_id?: string;
  family_id?: string;
  aadhar_no?: string;
  dob: string;
  class: string;
  section?: string;
  medium: string;
  father_name: string;
  mother_name: string;
  photo_url?: string;
}

export interface ReportCardFormData {
  session: string;
  scholastic_data: SubjectMarks[];
  co_scholastic_data: CoScholasticEntry[];
  personal_qualities: PersonalQuality[];
  attendance: AttendanceData;
  teacher_remarks?: string;
  promoted_to?: string;
}
