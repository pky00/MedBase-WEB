import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { InventoryTransaction } from '../../core/models/inventory-transaction.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-transaction-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionListComponent implements OnInit {
  transactions = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper(10, 'transaction_date');
  filterTransactionType = signal('');

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'transaction_type', label: 'Type', sortable: true, format: this.formatTransactionType },
    { key: 'third_party_name', label: 'Third Party', sortable: false },
    { key: 'transaction_date', label: 'Date', sortable: true, format: this.formatDate },
    { key: 'notes', label: 'Notes', sortable: false, format: this.formatNotes },
  ];

  actions: TableAction[] = [
    { label: 'View', action: 'view' },
    { label: 'Delete', action: 'delete', variant: 'danger' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.table.sortOrder.set('desc');
    this.loadTransactions();
  }

  formatTransactionType(value: unknown): string {
    const map: Record<string, string> = {
      purchase: 'Purchase',
      donation: 'Donation',
      prescription: 'Prescription',
      loss: 'Loss',
      breakage: 'Breakage',
      expiration: 'Expiration',
      destruction: 'Destruction',
    };
    return map[value as string] || String(value || '—');
  }

  formatDate(value: unknown): string {
    if (!value) return '—';
    return new Date(value as string).toLocaleDateString();
  }

  formatNotes(value: unknown): string {
    if (!value) return '—';
    const str = String(value);
    return str.length > 50 ? str.substring(0, 50) + '...' : str;
  }

  loadTransactions(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterTransactionType()) params['transaction_type'] = this.filterTransactionType();

    this.api.getList<InventoryTransaction>(API.INVENTORY_TRANSACTIONS, params).subscribe({
      next: (response: PaginatedResponse<InventoryTransaction>) => {
        this.transactions.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load transactions.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS, id]);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createTransaction(): void {
    this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.INVENTORY_TRANSACTIONS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Transaction deleted successfully.');
        this.loadTransactions();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete transaction.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
