import { ThirdParty } from './third-party.model';

export interface User {
  id: number;
  username: string;
  email: string;
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
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}
