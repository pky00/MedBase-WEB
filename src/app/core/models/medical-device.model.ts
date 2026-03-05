export interface MedicalDevice {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  category_name: string | null;
  quantity: number;
}

export interface MedicalDeviceCreate {
  name: string;
  description?: string;
  category_id: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  is_active?: boolean;
}

export interface MedicalDeviceUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  manufacturer?: string | null;
  model?: string | null;
  serial_number?: string | null;
  is_active?: boolean;
}
