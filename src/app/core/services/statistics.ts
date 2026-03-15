import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api';
import { AppointmentStats, InventoryStats, SummaryStats, TransactionStats } from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<SummaryStats> {
    return this.api.get<SummaryStats>('statistics/summary');
  }

  getAppointmentStats(): Observable<AppointmentStats> {
    return this.api.get<AppointmentStats>('statistics/appointments');
  }

  getInventoryStats(): Observable<InventoryStats> {
    return this.api.get<InventoryStats>('statistics/inventory');
  }

  getTransactionStats(): Observable<TransactionStats> {
    return this.api.get<TransactionStats>('statistics/transactions');
  }
}
