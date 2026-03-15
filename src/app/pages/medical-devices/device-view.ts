import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { ItemTransaction, TransactionType } from '../../core/models/inventory-transaction.model';
import { MedicalDevice } from '../../core/models/medical-device.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-device-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './device-view.html',
  styleUrl: './device-view.scss',
})
export class DeviceViewComponent implements OnInit {
  device = signal<MedicalDevice | null>(null);
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
      this.loadDevice(Number(id));
    }
  }

  loadDevice(id: number): void {
    this.loading.set(true);
    this.api.get<MedicalDevice>(`${API.MEDICAL_DEVICES}/${id}`).subscribe({
      next: (device) => {
        this.device.set(device);
        this.loading.set(false);
        this.loadTransactions(device.item_id);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medical device.');
        this.router.navigate([ROUTES.MEDICAL_DEVICES]);
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
    const d = this.device();
    if (d) {
      this.loadTransactions(d.item_id, page);
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

  editDevice(): void {
    this.router.navigate([ROUTES.MEDICAL_DEVICES, this.device()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.MEDICAL_DEVICES]);
  }
}
