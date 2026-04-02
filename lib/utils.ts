import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getGradeFromMarks(marks: number, total: number): string {
  if (!total || total <= 0 || isNaN(marks)) return '—';
  const pct = (marks / total) * 100;
  if (pct >= 91) return 'A+';
  if (pct >= 81) return 'A';
  if (pct >= 71) return 'B+';
  if (pct >= 61) return 'B';
  if (pct >= 51) return 'C+';
  if (pct >= 41) return 'C';
  if (pct >= 33) return 'D';
  return 'E';
}

/** Safely truncate text for display, with optional ellipsis */
export function truncateText(text: string | null | undefined, maxLen: number): string {
  if (!text) return '—';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export const CLASS_OPTIONS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];

export const MEDIUM_OPTIONS = ['Hindi', 'English'];

export const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E'];

export const CO_SCHOLASTIC_AREAS = [
  'Literary & Creative Skills',
  'Scientific Skills',
  'Information & Communication Technology',
  'Organizational Ability',
  'Art Education',
  'Health & Physical Education',
];

export const PERSONAL_QUALITIES_LIST = [
  'Regularity',
  'Punctuality',
  'Cleanliness',
  'Discipline',
  'Respect for Rules',
  'Cooperative Behaviour',
  'Sense of Responsibility',
];

export const DEFAULT_SUBJECTS_BY_CLASS: Record<string, string[]> = {
  '1': ['Hindi', 'English', 'Mathematics', 'Environmental Studies'],
  '2': ['Hindi', 'English', 'Mathematics', 'Environmental Studies'],
  '3': ['Hindi', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
  '4': ['Hindi', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
  '5': ['Hindi', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge', 'Computer'],
  '6': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  '7': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  '8': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  '9': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Information Technology'],
  '10': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Information Technology'],
  '11': ['Hindi', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology/Computer Science'],
  '12': ['Hindi', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology/Computer Science'],
};
