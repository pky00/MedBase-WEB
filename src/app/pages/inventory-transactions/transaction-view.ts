import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { InventoryTransaction } from '../../core/models/inventory-transaction.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-transaction-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './transaction-view.html',
  styleUrl: './transaction-view.scss',
})
export class TransactionViewComponent implements OnInit {
  transaction = signal<InventoryTransaction | null>(null);
  loading = signal(true);

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransaction(Number(id));
    }
  }

  loadTransaction(id: number): void {
    this.loading.set(true);
    this.api.get<InventoryTransaction>(`${API.INVENTORY_TRANSACTIONS}/${id}`).subscribe({
      next: (transaction) => {
        this.transaction.set(transaction);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load transaction.');
        this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS]);
      },
    });
  }

  formatTransactionType(type: string): string {
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

  formatItemType(type: string): string {
    const map: Record<string, string> = {
      medicine: 'Medicine',
      equipment: 'Equipment',
      medical_device: 'Medical Device',
    };
    return map[type] || type;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  editTransaction(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS, id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS]);
  }
}
