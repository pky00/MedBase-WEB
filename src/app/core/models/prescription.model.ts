export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled';

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  medical_record_id: string | null;
  prescription_date: string;
  diagnosis: string | null;
  notes: string | null;
  pharmacy_notes: string | null;
  status: PrescriptionStatus;
  dispensed_at: string | null;
  is_refillable: boolean;
  refills_remaining: number;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  // Expanded relations
  patient?: { first_name: string; last_name: string; patient_number: string };
  doctor?: { first_name: string; last_name: string; specialization: string };
}

export interface PrescriptionCreate {
  patient_id: string;
  doctor_id: string;
  prescription_date: string;
  prescription_number?: string | null;
  appointment_id?: string | null;
  medical_record_id?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  pharmacy_notes?: string | null;
  status?: PrescriptionStatus;
  is_refillable?: boolean;
  refills_remaining?: number;
  valid_until?: string | null;
}

export interface PrescriptionUpdate {
  patient_id?: string;
  doctor_id?: string;
  prescription_date?: string;
  appointment_id?: string | null;
  medical_record_id?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  pharmacy_notes?: string | null;
  status?: PrescriptionStatus;
  is_refillable?: boolean;
  refills_remaining?: number;
  valid_until?: string | null;
}

export interface PrescriptionListResponse {
  data: Prescription[];
  total: number;
  page: number;
  size: number;
}

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  pending: 'Pending',
  dispensed: 'Dispensed',
  cancelled: 'Cancelled'
};

