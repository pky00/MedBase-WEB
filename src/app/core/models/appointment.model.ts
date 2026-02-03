export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'checkup';

export interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  chief_complaint: string | null;
  notes: string | null;
  is_follow_up: boolean;
  previous_appointment_id: string | null;
  created_at: string;
  updated_at: string;
  // Expanded relations
  patient?: { first_name: string; last_name: string; patient_number: string };
  doctor?: { first_name: string; last_name: string; specialization: string };
}

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  appointment_type?: AppointmentType;
  appointment_number?: string | null;
  chief_complaint?: string | null;
  notes?: string | null;
  is_follow_up?: boolean;
  previous_appointment_id?: string | null;
}

export interface AppointmentUpdate {
  patient_id?: string;
  doctor_id?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  chief_complaint?: string | null;
  notes?: string | null;
  is_follow_up?: boolean;
  previous_appointment_id?: string | null;
}

export interface AppointmentListResponse {
  data: Appointment[];
  total: number;
  page: number;
  size: number;
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  rescheduled: 'Rescheduled'
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: 'Consultation',
  follow_up: 'Follow-up',
  emergency: 'Emergency',
  checkup: 'Checkup'
};

