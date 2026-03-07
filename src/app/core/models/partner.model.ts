export type PartnerType = 'donor' | 'referral' | 'both';
export type OrganizationType = 'NGO' | 'organization' | 'individual' | 'hospital' | 'medical_center';

export interface Partner {
  id: number;
  name: string;
  partner_type: PartnerType;
  organization_type: OrganizationType | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  third_party_id: number;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface PartnerCreate {
  name: string;
  partner_type: PartnerType;
  organization_type?: OrganizationType | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
  third_party_id?: number | null;
}

export interface PartnerUpdate {
  name?: string | null;
  partner_type?: PartnerType | null;
  organization_type?: OrganizationType | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean | null;
}
