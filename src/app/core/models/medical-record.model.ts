export interface MedicalRecord {
  id: string;
  record_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  visit_date: string;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  physical_examination: string | null;
  assessment: string | null;
  diagnosis: string[] | null;
  icd_codes: string[] | null;
  treatment_plan: string | null;
  procedures_performed: string | null;
  follow_up_instructions: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Expanded relations
  patient?: { first_name: string; last_name: string; patient_number: string };
  doctor?: { first_name: string; last_name: string; specialization: string };
}

export interface MedicalRecordCreate {
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  record_number?: string | null;
  appointment_id?: string | null;
  chief_complaint?: string | null;
  history_of_present_illness?: string | null;
  physical_examination?: string | null;
  assessment?: string | null;
  diagnosis?: string[] | null;
  icd_codes?: string[] | null;
  treatment_plan?: string | null;
  procedures_performed?: string | null;
  follow_up_instructions?: string | null;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface MedicalRecordUpdate {
  patient_id?: string;
  doctor_id?: string;
  visit_date?: string;
  appointment_id?: string | null;
  chief_complaint?: string | null;
  history_of_present_illness?: string | null;
  physical_examination?: string | null;
  assessment?: string | null;
  diagnosis?: string[] | null;
  icd_codes?: string[] | null;
  treatment_plan?: string | null;
  procedures_performed?: string | null;
  follow_up_instructions?: string | null;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface MedicalRecordListResponse {
  data: MedicalRecord[];
  total: number;
  page: number;
  size: number;
}

