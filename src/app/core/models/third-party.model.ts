export interface ThirdParty {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface ThirdPartyUpdate {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean | null;
}
