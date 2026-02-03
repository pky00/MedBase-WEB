export type EquipmentCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs_repair' | 'out_of_service';

export interface MedicalDeviceCategory {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalDevice {
  id: string;
  code: string | null;
  name: string;
  category_id: string | null;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  specifications: string | null;
  size: string | null;
  is_reusable: boolean;
  requires_fitting: boolean;
  purchase_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Expanded relations
  category?: MedicalDeviceCategory;
}

export interface MedicalDeviceCreate {
  name: string;
  code?: string | null;
  category_id?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  specifications?: string | null;
  size?: string | null;
  is_reusable?: boolean;
  requires_fitting?: boolean;
  purchase_price?: number | null;
  is_active?: boolean;
}

export interface MedicalDeviceUpdate {
  name?: string;
  code?: string | null;
  category_id?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  specifications?: string | null;
  size?: string | null;
  is_reusable?: boolean;
  requires_fitting?: boolean;
  purchase_price?: number | null;
  is_active?: boolean;
}

export interface MedicalDeviceListResponse {
  data: MedicalDevice[];
  total: number;
  page: number;
  size: number;
}

export interface MedicalDeviceCategoryListResponse {
  data: MedicalDeviceCategory[];
  total: number;
  page: number;
  size: number;
}

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  new: 'New',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needs_repair: 'Needs Repair',
  out_of_service: 'Out of Service'
};

