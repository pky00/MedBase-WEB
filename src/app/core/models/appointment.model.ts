export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AppointmentType = 'scheduled' | 'walk_in';
export type AppointmentLocation = 'internal' | 'external';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number | null;
  partner_id: number | null;
  appointment_date: string;
  status: AppointmentStatus;
  type: AppointmentType;
  location: AppointmentLocation;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  patient_name: string | null;
  doctor_name: string | null;
  partner_name: string | null;
}

export interface AppointmentDetail extends Appointment {
  vital_signs: VitalSign | null;
  medical_record: MedicalRecord | null;
}

export interface AppointmentCreate {
  patient_id: number;
  doctor_id?: number | null;
  partner_id?: number | null;
  appointment_date: string;
  type: AppointmentType;
  location?: AppointmentLocation;
  notes?: string | null;
  status?: AppointmentStatus;
}

export interface AppointmentUpdate {
  patient_id?: number | null;
  doctor_id?: number | null;
  partner_id?: number | null;
  appointment_date?: string | null;
  type?: AppointmentType | null;
  location?: AppointmentLocation | null;
  notes?: string | null;
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
}

export interface VitalSign {
  id: number;
  appointment_id: number;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: string | null;
  respiratory_rate: number | null;
  weight: string | null;
  height: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface VitalSignCreate {
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  heart_rate?: number | null;
  temperature?: number | string | null;
  respiratory_rate?: number | null;
  weight?: number | string | null;
  height?: number | string | null;
  notes?: string | null;
}

export interface VitalSignUpdate extends VitalSignCreate {}

export interface MedicalRecord {
  id: number;
  appointment_id: number;
  chief_complaint: string | null;
  diagnosis: string | null;
  treatment_notes: string | null;
  follow_up_date: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  patient_name?: string | null;
}

export interface MedicalRecordCreate {
  chief_complaint?: string | null;
  diagnosis?: string | null;
  treatment_notes?: string | null;
  follow_up_date?: string | null;
}

export interface MedicalRecordUpdate extends MedicalRecordCreate {}
