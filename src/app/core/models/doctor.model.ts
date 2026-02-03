import { GenderType } from './patient.model';

export interface Doctor {
  id: string;
  user_id: string | null;
  donor_id: string | null;
  first_name: string;
  last_name: string;
  gender: GenderType | null;
  specialization: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  qualification: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorCreate {
  first_name: string;
  last_name: string;
  specialization: string;
  user_id?: string | null;
  donor_id?: string | null;
  gender?: GenderType | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  qualification?: string | null;
  bio?: string | null;
}

export interface DoctorUpdate {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  user_id?: string | null;
  donor_id?: string | null;
  gender?: GenderType | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  qualification?: string | null;
  bio?: string | null;
}

export interface DoctorListResponse {
  data: Doctor[];
  total: number;
  page: number;
  size: number;
}

