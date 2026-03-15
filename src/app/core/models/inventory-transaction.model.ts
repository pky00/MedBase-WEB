export type TransactionType = 'purchase' | 'donation' | 'prescription' | 'loss' | 'breakage' | 'expiration' | 'destruction';
export type ItemType = 'medicine' | 'equipment' | 'medical_device';

export interface TransactionItem {
  id: number;
  transaction_id: number;
  item_type: string;
  item_id: number;
  quantity: number;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  item_name: string | null;
}

export interface InventoryTransaction {
  id: number;
  transaction_type: TransactionType;
  third_party_id: number;
  appointment_id: number | null;
  transaction_date: string;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  third_party_name: string | null;
  items: TransactionItem[] | null;
}

export interface TransactionItemCreate {
  item_type: ItemType;
  item_id: number;
  quantity: number;
}

export interface InventoryTransactionCreate {
  transaction_type: TransactionType;
  third_party_id?: number | null;
  appointment_id?: number | null;
  transaction_date: string;
  notes?: string | null;
  items?: TransactionItemCreate[] | null;
}

export interface InventoryTransactionUpdate {
  transaction_date?: string | null;
  notes?: string | null;
}

export interface ItemTransaction {
  id: number;
  transaction_type: TransactionType;
  third_party_id: number;
  third_party_name: string | null;
  appointment_id: number | null;
  transaction_date: string;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  transaction_item: TransactionItem | null;
}
