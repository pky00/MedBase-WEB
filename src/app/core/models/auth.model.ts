import { ThirdParty } from './third-party.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
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

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}
