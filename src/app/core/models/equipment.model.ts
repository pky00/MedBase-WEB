import { Category } from './category.model';

export type EquipmentCondition = 'new' | 'good' | 'fair' | 'poor';

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  condition: EquipmentCondition | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  inventory_quantity: number | null;
  category: Category | null;
}

export interface EquipmentCreate {
  name: string;
  category_id?: number | null;
  description?: string | null;
  condition?: EquipmentCondition | null;
  is_active?: boolean;
}

export interface EquipmentUpdate {
  name?: string | null;
  category_id?: number | null;
  description?: string | null;
  condition?: EquipmentCondition | null;
  is_active?: boolean | null;
}
