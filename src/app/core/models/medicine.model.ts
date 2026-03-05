import { Category } from './category.model';

export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  unit: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  inventory_quantity: number | null;
  category: Category | null;
}

export interface MedicineCreate {
  name: string;
  category_id?: number | null;
  description?: string | null;
  unit?: string | null;
  is_active?: boolean;
}

export interface MedicineUpdate {
  name?: string | null;
  category_id?: number | null;
  description?: string | null;
  unit?: string | null;
  is_active?: boolean | null;
}
