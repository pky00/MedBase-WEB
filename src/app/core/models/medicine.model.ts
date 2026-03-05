export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  dosage: string | null;
  unit: string | null;
  manufacturer: string | null;
  expiry_date: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  category_name: string | null;
  quantity: number;
}

export interface MedicineCreate {
  name: string;
  description?: string;
  category_id: number;
  dosage?: string;
  unit?: string;
  manufacturer?: string;
  expiry_date?: string;
  is_active?: boolean;
}

export interface MedicineUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  dosage?: string | null;
  unit?: string | null;
  manufacturer?: string | null;
  expiry_date?: string | null;
  is_active?: boolean;
}
