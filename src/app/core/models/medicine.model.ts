export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  category_name: string | null;
  is_active: boolean;
  quantity: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineCreate {
  name: string;
  description?: string;
  category_id: number;
  is_active?: boolean;
}

export interface MedicineUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  is_active?: boolean;
}
