export interface SummaryStats {
  total_patients: number;
  total_appointments: number;
  total_inventory_items: number;
  total_transactions: number;
  total_partners: number;
  total_doctors: number;
  active_patients: number;
  active_partners: number;
  active_doctors: number;
}

export interface AppointmentsByStatus {
  status: string;
  count: number;
}

export interface AppointmentsByMonth {
  month: string;
  count: number;
}

export interface AppointmentStats {
  today_count: number;
  upcoming_count: number;
  by_status: AppointmentsByStatus[];
  by_month: AppointmentsByMonth[];
  total_completed: number;
  total_cancelled: number;
}

export interface LowStockItem {
  item_type: string;
  item_id: number;
  item_name: string;
  quantity: number;
}

export interface InventoryByType {
  item_type: string;
  count: number;
  total_quantity: number;
}

export interface InventoryStats {
  total_items: number;
  total_quantity: number;
  low_stock_items: LowStockItem[];
  items_by_type: InventoryByType[];
}

export interface TransactionsByType {
  transaction_type: string;
  count: number;
  total_items: number;
}

export interface RecentTransaction {
  id: number;
  transaction_type: string;
  transaction_date: string;
  third_party_name: string | null;
  item_count: number;
}

export interface TransactionStats {
  total_transactions: number;
  by_type: TransactionsByType[];
  recent_transactions: RecentTransaction[];
}
