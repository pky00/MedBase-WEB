import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  summary: SummaryStats | null = null;
  appointmentStats: AppointmentStats | null = null;
  inventoryStats: InventoryStats | null = null;
  transactionStats: TransactionStats | null = null;

  loading = true;
  error = '';

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    let completed = 0;
    const total = 4;
    const checkDone = (): void => {
      completed++;
      if (completed === total) {
        this.loading = false;
      }
    };

    this.statisticsService.getSummary().subscribe({
      next: (data) => (this.summary = data),
      error: (err) => {
        this.error = 'Failed to load summary statistics.';
        checkDone();
      },
      complete: () => checkDone(),
    });

    this.statisticsService.getAppointmentStats().subscribe({
      next: (data) => (this.appointmentStats = data),
      error: () => checkDone(),
      complete: () => checkDone(),
    });

    this.statisticsService.getInventoryStats().subscribe({
      next: (data) => (this.inventoryStats = data),
      error: () => checkDone(),
      complete: () => checkDone(),
    });

    this.statisticsService.getTransactionStats().subscribe({
      next: (data) => (this.transactionStats = data),
      error: () => checkDone(),
      complete: () => checkDone(),
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

  get lowStockItems(): LowStockItem[] {
    return this.inventoryStats?.low_stock_items || [];
  }

  get recentTransactions(): RecentTransaction[] {
    return this.transactionStats?.recent_transactions || [];
  }
}
