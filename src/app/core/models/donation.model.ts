export type DonationType = 'medicine' | 'equipment' | 'medical_device' | 'mixed';
export type EquipmentCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs_repair' | 'out_of_service';

// Medicine Item Interfaces
export interface DonationMedicineItem {
  id: string;
  donation_id: string;
  medicine_id: string | null;
  medicine_name: string;
  quantity: number;
  unit: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  estimated_unit_value: number | null;
  total_value: number | null;
  condition_notes: string | null;
  is_deleted: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

// Equipment Item Interfaces
export interface DonationEquipmentItem {
  id: string;
  donation_id: string;
  equipment_id: string | null;
  equipment_name: string;
  model: string | null;
  serial_number: string | null;
  quantity: number;
  equipment_condition: EquipmentCondition;
  estimated_value: number | null;
  condition_notes: string | null;
  is_deleted: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

// Medical Device Item Interfaces
export interface DonationMedicalDeviceItem {
  id: string;
  donation_id: string;
  device_id: string | null;
  device_name: string;
  model: string | null;
  serial_number: string | null;
  quantity: number;
  device_condition: EquipmentCondition;
  estimated_value: number | null;
  condition_notes: string | null;
  is_deleted: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface Donation {
  id: string;
  donation_number: string;
  donor_id: string;
  donation_type: DonationType;
  donation_date: string;
  received_date: string | null;
  total_estimated_value: number | null;
  total_items_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Expanded relations
  donor?: { name: string; donor_type: string };
  // Item lists
  medicine_items: DonationMedicineItem[];
  equipment_items: DonationEquipmentItem[];
  medical_device_items: DonationMedicalDeviceItem[];
}

export interface DonationCreate {
  donor_id: string;
  donation_type: DonationType;
  donation_date: string;
  donation_number?: string | null;
  received_date?: string | null;
  total_estimated_value?: number | null;
  total_items_count?: number;
  notes?: string | null;
}

export interface DonationUpdate {
  donor_id?: string;
  donation_type?: DonationType;
  donation_date?: string;
  received_date?: string | null;
  total_estimated_value?: number | null;
  total_items_count?: number;
  notes?: string | null;
}

export interface DonationListResponse {
  data: Donation[];
  total: number;
  page: number;
  size: number;
}

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  medicine: 'Medicine',
  equipment: 'Equipment',
  medical_device: 'Medical Device',
  mixed: 'Mixed'
};

