export type EquipmentCondition = 'new' | 'good' | 'fair' | 'poor';

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  model: string | null;
  serial_number: string | null;
  condition: EquipmentCondition;
  purchase_date: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  category_name: string | null;
  quantity: number;
}

export interface EquipmentCreate {
  name: string;
  description?: string;
  category_id: number;
  model?: string;
  serial_number?: string;
  condition: EquipmentCondition;
  purchase_date?: string;
  is_active?: boolean;
}

export interface EquipmentUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  model?: string | null;
  serial_number?: string | null;
  condition?: EquipmentCondition;
  purchase_date?: string | null;
  is_active?: boolean;
}
