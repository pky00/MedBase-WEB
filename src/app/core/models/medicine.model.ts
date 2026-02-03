export type DosageForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'ointment' | 'drops' | 'inhaler' | 'patch' | 'suppository' | 'powder' | 'solution' | 'suspension' | 'gel' | 'spray' | 'other';

export interface MedicineCategory {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  code: string | null;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  category_id: string | null;
  manufacturer: string | null;
  dosage_form: DosageForm;
  strength: string | null;
  unit: string;
  package_size: string | null;
  barcode: string | null;
  purchase_price: number | null;
  description: string | null;
  indications: string | null;
  contraindications: string | null;
  side_effects: string | null;
  storage_conditions: string | null;
  requires_prescription: boolean;
  is_controlled_substance: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Expanded relations
  category?: MedicineCategory;
}

export interface MedicineCreate {
  name: string;
  dosage_form: DosageForm;
  unit: string;
  code?: string | null;
  generic_name?: string | null;
  brand_name?: string | null;
  category_id?: string | null;
  manufacturer?: string | null;
  strength?: string | null;
  package_size?: string | null;
  barcode?: string | null;
  purchase_price?: number | null;
  description?: string | null;
  indications?: string | null;
  contraindications?: string | null;
  side_effects?: string | null;
  storage_conditions?: string | null;
  requires_prescription?: boolean;
  is_controlled_substance?: boolean;
  is_active?: boolean;
}

export interface MedicineUpdate {
  name?: string;
  dosage_form?: DosageForm;
  unit?: string;
  code?: string | null;
  generic_name?: string | null;
  brand_name?: string | null;
  category_id?: string | null;
  manufacturer?: string | null;
  strength?: string | null;
  package_size?: string | null;
  barcode?: string | null;
  purchase_price?: number | null;
  description?: string | null;
  indications?: string | null;
  contraindications?: string | null;
  side_effects?: string | null;
  storage_conditions?: string | null;
  requires_prescription?: boolean;
  is_controlled_substance?: boolean;
  is_active?: boolean;
}

export interface MedicineListResponse {
  data: Medicine[];
  total: number;
  page: number;
  size: number;
}

export interface MedicineCategoryListResponse {
  data: MedicineCategory[];
  total: number;
  page: number;
  size: number;
}

export const DOSAGE_FORM_LABELS: Record<DosageForm, string> = {
  tablet: 'Tablet',
  capsule: 'Capsule',
  syrup: 'Syrup',
  injection: 'Injection',
  cream: 'Cream',
  ointment: 'Ointment',
  drops: 'Drops',
  inhaler: 'Inhaler',
  patch: 'Patch',
  suppository: 'Suppository',
  powder: 'Powder',
  solution: 'Solution',
  suspension: 'Suspension',
  gel: 'Gel',
  spray: 'Spray',
  other: 'Other'
};

