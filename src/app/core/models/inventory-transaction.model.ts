export type TransactionType = 'purchase' | 'donation' | 'prescription' | 'loss' | 'breakage' | 'expiration' | 'destruction';

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
