import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { ItemTransaction, TransactionType } from '../../core/models/inventory-transaction.model';
import { Medicine } from '../../core/models/medicine.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-medicine-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './medicine-view.html',
  styleUrl: './medicine-view.scss',
})
export class MedicineViewComponent implements OnInit {
  medicine = signal<Medicine | null>(null);
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
      this.loadMedicine(Number(id));
    }
  }

  loadMedicine(id: number): void {
    this.loading.set(true);
    this.api.get<Medicine>(`${API.MEDICINES}/${id}`).subscribe({
      next: (medicine) => {
        this.medicine.set(medicine);
        this.loading.set(false);
        this.loadTransactions(medicine.item_id);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medicine.');
        this.router.navigate([ROUTES.MEDICINES]);
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
    const m = this.medicine();
    if (m) {
      this.loadTransactions(m.item_id, page);
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

  editMedicine(): void {
    this.router.navigate([ROUTES.MEDICINES, this.medicine()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.MEDICINES]);
  }
}
