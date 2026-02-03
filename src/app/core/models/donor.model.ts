export type DonorType = 'individual' | 'organization' | 'government' | 'ngo' | 'pharmaceutical_company';

export interface Donor {
  id: string;
  donor_code: string | null;
  name: string;
  donor_type: DonorType;
  contact_person: string | null;
  phone: string | null;
  alternative_phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DonorCreate {
  name: string;
  donor_type: DonorType;
  donor_code?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface DonorUpdate {
  name?: string;
  donor_type?: DonorType;
  donor_code?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface DonorListResponse {
  data: Donor[];
  total: number;
  page: number;
  size: number;
}

export const DONOR_TYPE_LABELS: Record<DonorType, string> = {
  individual: 'Individual',
  organization: 'Organization',
  government: 'Government',
  ngo: 'NGO',
  pharmaceutical_company: 'Pharmaceutical Company'
};

