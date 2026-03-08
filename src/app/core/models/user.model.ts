import { ThirdParty } from './third-party.model';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_deleted: boolean;
  third_party_id: number;
  third_party: ThirdParty | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface UserCreate {
  third_party_id?: number | null;
  username: string;
  name?: string | null;
  email?: string | null;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}
