export type DoctorType = 'internal' | 'external' | 'partner_provided';

export interface Doctor {
  id: number;
  name: string;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  type: DoctorType;
  partner_id: number | null;
  is_active: boolean;
  third_party_id: number;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface DoctorDetail extends Doctor {
  partner_name: string | null;
}

export interface DoctorCreate {
  name: string;
  type: DoctorType;
  specialization?: string | null;
  phone?: string | null;
  email?: string | null;
  partner_id?: number | null;
  is_active?: boolean;
}

export interface DoctorUpdate {
  name?: string | null;
  type?: DoctorType | null;
  specialization?: string | null;
  phone?: string | null;
  email?: string | null;
  partner_id?: number | null;
  is_active?: boolean | null;
}
