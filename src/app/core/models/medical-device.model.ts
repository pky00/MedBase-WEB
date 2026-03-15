import { Category } from './category.model';

export interface MedicalDevice {
  id: number;
  item_id: number;
  code: string;
  name: string;
  description: string | null;
  category_id: number | null;
  serial_number: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  inventory_quantity: number | null;
  category: Category | null;
}

export interface MedicalDeviceCreate {
  code: string;
  name: string;
  category_id?: number | null;
  description?: string | null;
  serial_number?: string | null;
  is_active?: boolean;
}

export interface MedicalDeviceUpdate {
  code?: string | null;
  name?: string | null;
  category_id?: number | null;
  description?: string | null;
  serial_number?: string | null;
  is_active?: boolean | null;
}
