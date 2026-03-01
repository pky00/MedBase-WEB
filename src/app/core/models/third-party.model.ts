export interface ThirdParty {
  id: number;
  name: string;
  type: 'user' | 'doctor' | 'patient' | 'partner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
