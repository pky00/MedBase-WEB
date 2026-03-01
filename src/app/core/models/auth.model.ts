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
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  third_party_id: number;
}
