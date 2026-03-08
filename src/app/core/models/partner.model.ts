import { ThirdParty } from './third-party.model';

export type PartnerType = 'donor' | 'referral' | 'both';
export type OrganizationType = 'NGO' | 'organization' | 'individual' | 'hospital' | 'medical_center';

export interface Partner {
  id: number;
  third_party_id: number;
  third_party: ThirdParty | null;
  partner_type: PartnerType;
  organization_type: OrganizationType | null;
  contact_person: string | null;
  address: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface PartnerCreate {
  third_party_id?: number | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  partner_type: PartnerType;
  organization_type?: OrganizationType | null;
  contact_person?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface PartnerUpdate {
  partner_type?: PartnerType | null;
  organization_type?: OrganizationType | null;
  contact_person?: string | null;
  address?: string | null;
  is_active?: boolean | null;
}
