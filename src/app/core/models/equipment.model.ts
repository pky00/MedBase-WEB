import { EquipmentCondition } from './medical-device.model';

export interface EquipmentCategory {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  asset_code: string | null;
  name: string;
  category_id: string | null;
  model: string | null;
  manufacturer: string | null;
  serial_number: string | null;
  barcode: string | null;
  description: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  is_donation: boolean;
  donor_id: string | null;
  donation_id: string | null;
  equipment_condition: EquipmentCondition;
  is_portable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Expanded relations
  category?: EquipmentCategory;
  donor?: { name: string };
}

export interface EquipmentCreate {
  name: string;
  asset_code?: string | null;
  category_id?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  serial_number?: string | null;
  barcode?: string | null;
  description?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  is_donation?: boolean;
  donor_id?: string | null;
  donation_id?: string | null;
  equipment_condition?: EquipmentCondition;
  is_portable?: boolean;
  is_active?: boolean;
}

export interface EquipmentUpdate {
  name?: string;
  asset_code?: string | null;
  category_id?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  serial_number?: string | null;
  barcode?: string | null;
  description?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  is_donation?: boolean;
  donor_id?: string | null;
  donation_id?: string | null;
  equipment_condition?: EquipmentCondition;
  is_portable?: boolean;
  is_active?: boolean;
}

export interface EquipmentListResponse {
  data: Equipment[];
  total: number;
  page: number;
  size: number;
}

export interface EquipmentCategoryListResponse {
  data: EquipmentCategory[];
  total: number;
  page: number;
  size: number;
}

