import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Equipment } from '../../core/models/equipment.model';
import { ItemTransaction, TransactionType } from '../../core/models/inventory-transaction.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-equipment-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './equipment-view.html',
  styleUrl: './equipment-view.scss',
})
export class EquipmentViewComponent implements OnInit {
  equipment = signal<Equipment | null>(null);
  loading = signal(true);

  transactions = signal<ItemTransaction[]>([]);
  transactionsLoading = signal(false);
  transactionsTotal = signal(0);
  transactionsPage = signal(1);
  transactionsPages = signal(1);

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEquipment(Number(id));
    }
  }

  loadEquipment(id: number): void {
    this.loading.set(true);
    this.api.get<Equipment>(`${API.EQUIPMENT}/${id}`).subscribe({
      next: (equipment) => {
        this.equipment.set(equipment);
        this.loading.set(false);
        this.loadTransactions(equipment.item_id);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load equipment.');
        this.router.navigate([ROUTES.EQUIPMENT]);
      },
    });
  }

  loadTransactions(itemId: number, page: number = 1): void {
    this.transactionsLoading.set(true);
    const params: QueryParams = {
      page,
      size: 10,
      sort: 'transaction_date',
      order: 'desc',
    };
    this.api.getList<ItemTransaction>(`${API.INVENTORY_TRANSACTIONS}/by-item/${itemId}`, params).subscribe({
      next: (response: PaginatedResponse<ItemTransaction>) => {
        this.transactions.set(response.items);
        this.transactionsTotal.set(response.total);
        this.transactionsPage.set(response.page);
        this.transactionsPages.set(response.pages);
        this.transactionsLoading.set(false);
      },
      error: () => {
        this.transactionsLoading.set(false);
      },
    });
  }

  goToTransactionsPage(page: number): void {
    const e = this.equipment();
    if (e) {
      this.loadTransactions(e.item_id, page);
    }
  }

  viewTransaction(id: number): void {
    this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS, id]);
  }

  formatTransactionType(type: TransactionType | string): string {
    const map: Record<string, string> = {
      purchase: 'Purchase',
      donation: 'Donation',
      prescription: 'Prescription',
      loss: 'Loss',
      breakage: 'Breakage',
      expiration: 'Expiration',
      destruction: 'Destruction',
    };
    return map[type] || type;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  editEquipment(): void {
    this.router.navigate([ROUTES.EQUIPMENT, this.equipment()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.EQUIPMENT]);
  }
}
