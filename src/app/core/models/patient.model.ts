export type GenderType = 'male' | 'female';
export type BloodType = 'A_positive' | 'A_negative' | 'B_positive' | 'B_negative' | 'AB_positive' | 'AB_negative' | 'O_positive' | 'O_negative' | 'unknown';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: GenderType;
  blood_type: BloodType | null;
  national_id: string | null;
  passport_number: string | null;
  phone: string | null;
  alternative_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  occupation: string | null;
  marital_status: MaritalStatus | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: GenderType;
  patient_number?: string | null;
  blood_type?: BloodType | null;
  national_id?: string | null;
  passport_number?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  occupation?: string | null;
  marital_status?: MaritalStatus | null;
  notes?: string | null;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: GenderType;
  patient_number?: string | null;
  blood_type?: BloodType | null;
  national_id?: string | null;
  passport_number?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  occupation?: string | null;
  marital_status?: MaritalStatus | null;
  notes?: string | null;
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
  page: number;
  size: number;
}

export const GENDER_LABELS: Record<GenderType, string> = {
  male: 'Male',
  female: 'Female'
};

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_positive: 'A+',
  A_negative: 'A-',
  B_positive: 'B+',
  B_negative: 'B-',
  AB_positive: 'AB+',
  AB_negative: 'AB-',
  O_positive: 'O+',
  O_negative: 'O-',
  unknown: 'Unknown'
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Single',
  married: 'Married',
  divorced: 'Divorced',
  widowed: 'Widowed'
};

