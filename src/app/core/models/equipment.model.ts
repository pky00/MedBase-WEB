export type EquipmentCondition = 'new' | 'good' | 'fair' | 'poor';

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  category_name: string | null;
  condition: EquipmentCondition;
  is_active: boolean;
  quantity: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCreate {
  name: string;
  description?: string;
  category_id: number;
  condition: EquipmentCondition;
  is_active?: boolean;
}

export interface EquipmentUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  condition?: EquipmentCondition;
  is_active?: boolean;
}
