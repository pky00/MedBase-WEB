export type TreatmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Treatment {
  id: number;
  patient_id: number;
  appointment_id: number | null;
  partner_id: number;
  treatment_type: string;
  description: string | null;
  treatment_date: string | null;
  status: TreatmentStatus;
  cost: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  patient_name: string | null;
  partner_name: string | null;
}

export interface TreatmentCreate {
  patient_id: number;
  partner_id: number;
  appointment_id?: number | null;
  treatment_type: string;
  description?: string | null;
  treatment_date?: string | null;
  cost?: number | string | null;
  notes?: string | null;
  status?: TreatmentStatus;
}

export interface TreatmentUpdate {
  patient_id?: number | null;
  partner_id?: number | null;
  appointment_id?: number | null;
  treatment_type?: string | null;
  description?: string | null;
  treatment_date?: string | null;
  cost?: number | string | null;
  notes?: string | null;
}

export interface TreatmentStatusUpdate {
  status: TreatmentStatus;
}
