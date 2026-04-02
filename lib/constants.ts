// ============================================================
// c0rdly – Global Constants
// ============================================================

export const ACADEMIC_SESSIONS = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
] as const;

export type AcademicSession = (typeof ACADEMIC_SESSIONS)[number];

export const DEFAULT_SESSION: AcademicSession = '2024-25';
