import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { StatisticsService } from '../../core/services/statistics';
import {
  SummaryStats,
  AppointmentStats,
  InventoryStats,
  TransactionStats,
  LowStockItem,
  RecentTransaction,
} from '../../core/models/statistics.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  summary = signal<SummaryStats | null>(null);
  appointmentStats = signal<AppointmentStats | null>(null);
  inventoryStats = signal<InventoryStats | null>(null);
  transactionStats = signal<TransactionStats | null>(null);

  loading = signal(true);
  error = signal('');

  lowStockItems = computed(() => this.inventoryStats()?.low_stock_items || []);
  recentTransactions = computed(() => this.transactionStats()?.recent_transactions || []);

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      summary: this.statisticsService.getSummary().pipe(catchError(() => of(null))),
      appointments: this.statisticsService.getAppointmentStats().pipe(catchError(() => of(null))),
      inventory: this.statisticsService.getInventoryStats().pipe(catchError(() => of(null))),
      transactions: this.statisticsService.getTransactionStats().pipe(catchError(() => of(null))),
    }).subscribe({
      next: (results) => {
        this.summary.set(results.summary);
        this.appointmentStats.set(results.appointments);
        this.inventoryStats.set(results.inventory);
        this.transactionStats.set(results.transactions);

        if (!results.summary) {
          this.error.set('Failed to load summary statistics.');
        }
      },
      error: () => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'badge-blue',
      in_progress: 'badge-orange',
      completed: 'badge-green',
      cancelled: 'badge-gray',
    };
    return map[status] || 'badge-gray';
  }

  getTransactionTypeClass(type: string): string {
    const map: Record<string, string> = {
      purchase: 'badge-blue',
      donation: 'badge-green',
      prescription: 'badge-purple',
      loss: 'badge-orange',
      breakage: 'badge-red',
      expiration: 'badge-gray',
      destruction: 'badge-red',
    };
    return map[type] || 'badge-gray';
  }

  getItemTypeLabel(type: string): string {
    const map: Record<string, string> = {
      medicine: 'Medicine',
      equipment: 'Equipment',
      medical_device: 'Medical Device',
    };
    return map[type] || type;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  formatLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
