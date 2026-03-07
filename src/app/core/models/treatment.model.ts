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
