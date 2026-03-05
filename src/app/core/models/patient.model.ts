export type Gender = 'male' | 'female';

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  is_active: boolean;
  third_party_id: number;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface PatientDetail extends Patient {
  documents: PatientDocument[] | null;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  is_active?: boolean;
}

export interface PatientUpdate {
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  is_active?: boolean | null;
}

export interface PatientDocument {
  id: number;
  patient_id: number;
  document_name: string;
  document_type: string | null;
  file_path: string;
  file_url: string | null;
  upload_date: string;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}
