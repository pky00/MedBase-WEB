export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  third_party_id: number;
  created_at: string;
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
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}
