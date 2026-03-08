import { ThirdParty } from './third-party.model';

export type DoctorType = 'internal' | 'external' | 'partner_provided';

export interface Doctor {
  id: number;
  third_party_id: number;
  third_party: ThirdParty | null;
  specialization: string | null;
  type: DoctorType;
  partner_id: number | null;
  is_active: boolean;
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
  third_party_id?: number | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  specialization?: string | null;
  type: DoctorType;
  partner_id?: number | null;
  is_active?: boolean;
}

export interface DoctorUpdate {
  specialization?: string | null;
  type?: DoctorType | null;
  partner_id?: number | null;
  is_active?: boolean | null;
}
