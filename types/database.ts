/**
 * Veritabanı Type Definitions
 */

export type UserRole = 'CANDIDATE' | 'MIDDLEMAN' | 'CONSULTANT' | 'ADMIN';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  middleman_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateInfo {
  id: string;
  profile_id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  national_id: string | null;
  education_level: string | null;
  experience_years: number;
  skills: string[];
  languages: Array<{ name: string; level: string }>;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  profile_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}
