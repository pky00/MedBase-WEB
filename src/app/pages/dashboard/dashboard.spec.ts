import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard';
import { StatisticsService } from '../../core/services/statistics';
import {
  SummaryStats,
  AppointmentStats,
  InventoryStats,
  TransactionStats,
} from '../../core/models/statistics.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let statisticsService: {
    getSummary: ReturnType<typeof vi.fn>;
    getAppointmentStats: ReturnType<typeof vi.fn>;
    getInventoryStats: ReturnType<typeof vi.fn>;
    getTransactionStats: ReturnType<typeof vi.fn>;
  };

  const mockSummary: SummaryStats = {
    total_patients: 50,
    total_appointments: 120,
    total_inventory_items: 80,
    total_transactions: 200,
    total_partners: 15,
    total_doctors: 10,
    active_patients: 45,
    active_partners: 12,
    active_doctors: 9,
  };

  const mockAppointmentStats: AppointmentStats = {
    today_count: 5,
    upcoming_count: 12,
    by_status: [
      { status: 'scheduled', count: 30 },
      { status: 'completed', count: 80 },
      { status: 'cancelled', count: 10 },
    ],
    by_month: [
      { month: '2026-03', count: 25 },
      { month: '2026-02', count: 20 },
    ],
    total_completed: 80,
    total_cancelled: 10,
  };

  const mockInventoryStats: InventoryStats = {
    total_items: 80,
    total_quantity: 5000,
    low_stock_items: [
      { item_type: 'medicine', item_id: 1, item_name: 'Aspirin', quantity: 2 },
      { item_type: 'medical_device', item_id: 5, item_name: 'Thermometer', quantity: 0 },
    ],
    items_by_type: [
      { item_type: 'medicine', count: 40, total_quantity: 3000 },
      { item_type: 'equipment', count: 20, total_quantity: 1000 },
      { item_type: 'medical_device', count: 20, total_quantity: 1000 },
    ],
  };

  const mockTransactionStats: TransactionStats = {
    total_transactions: 200,
    by_type: [
      { transaction_type: 'purchase', count: 50, total_items: 150 },
      { transaction_type: 'donation', count: 30, total_items: 80 },
      { transaction_type: 'prescription', count: 100, total_items: 200 },
    ],
    recent_transactions: [
      {
        id: 1,
        transaction_type: 'purchase',
        transaction_date: '2026-03-15',
        third_party_name: null,
        item_count: 3,
      },
      {
        id: 2,
        transaction_type: 'donation',
        transaction_date: '2026-03-14',
        third_party_name: 'WHO',
        item_count: 5,
      },
    ],
  };

  beforeEach(async () => {
    statisticsService = {
      getSummary: vi.fn().mockReturnValue(of(mockSummary)),
      getAppointmentStats: vi.fn().mockReturnValue(of(mockAppointmentStats)),
      getInventoryStats: vi.fn().mockReturnValue(of(mockInventoryStats)),
      getTransactionStats: vi.fn().mockReturnValue(of(mockTransactionStats)),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: StatisticsService, useValue: statisticsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all statistics on init', () => {
    expect(statisticsService.getSummary).toHaveBeenCalled();
    expect(statisticsService.getAppointmentStats).toHaveBeenCalled();
    expect(statisticsService.getInventoryStats).toHaveBeenCalled();
    expect(statisticsService.getTransactionStats).toHaveBeenCalled();
  });

  it('should set loading to false after all data loads', () => {
    expect(component.loading).toBe(false);
  });

  it('should populate summary stats', () => {
    expect(component.summary).toEqual(mockSummary);
  });

  it('should populate appointment stats', () => {
    expect(component.appointmentStats).toEqual(mockAppointmentStats);
  });

  it('should populate inventory stats', () => {
    expect(component.inventoryStats).toEqual(mockInventoryStats);
  });

  it('should populate transaction stats', () => {
    expect(component.transactionStats).toEqual(mockTransactionStats);
  });

  it('should display summary cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    const statValues = el.querySelectorAll('.stat-value');
    expect(statValues.length).toBeGreaterThanOrEqual(6);
    expect(statValues[0].textContent?.trim()).toBe('50');
  });

  it('should display appointments by status', () => {
    const el = fixture.nativeElement as HTMLElement;
    const statusItems = el.querySelectorAll('.status-item');
    expect(statusItems.length).toBe(3);
  });

  it('should display low stock items', () => {
    const el = fixture.nativeElement as HTMLElement;
    const lowStockRows = el.querySelectorAll('.low-stock-row');
    expect(lowStockRows.length).toBe(2);
  });

  it('should display recent transactions', () => {
    const el = fixture.nativeElement as HTMLElement;
    const recentRows = el.querySelectorAll('.recent-row');
    expect(recentRows.length).toBe(2);
  });

  it('should display inventory by type', () => {
    const el = fixture.nativeElement as HTMLElement;
    const typeRows = el.querySelectorAll('.inventory-type-row');
    expect(typeRows.length).toBe(3);
  });

  it('should display transactions by type', () => {
    const el = fixture.nativeElement as HTMLElement;
    const typeRows = el.querySelectorAll('.transaction-type-row');
    expect(typeRows.length).toBe(3);
  });

  it('should return correct status badge class', () => {
    expect(component.getStatusBadgeClass('scheduled')).toBe('badge-blue');
    expect(component.getStatusBadgeClass('completed')).toBe('badge-green');
    expect(component.getStatusBadgeClass('cancelled')).toBe('badge-gray');
    expect(component.getStatusBadgeClass('in_progress')).toBe('badge-orange');
    expect(component.getStatusBadgeClass('unknown')).toBe('badge-gray');
  });

  it('should return correct transaction type class', () => {
    expect(component.getTransactionTypeClass('purchase')).toBe('badge-blue');
    expect(component.getTransactionTypeClass('donation')).toBe('badge-green');
    expect(component.getTransactionTypeClass('prescription')).toBe('badge-purple');
    expect(component.getTransactionTypeClass('loss')).toBe('badge-orange');
    expect(component.getTransactionTypeClass('breakage')).toBe('badge-red');
    expect(component.getTransactionTypeClass('unknown')).toBe('badge-gray');
  });

  it('should format item type labels', () => {
    expect(component.getItemTypeLabel('medicine')).toBe('Medicine');
    expect(component.getItemTypeLabel('equipment')).toBe('Equipment');
    expect(component.getItemTypeLabel('medical_device')).toBe('Medical Device');
  });

  it('should format labels correctly', () => {
    expect(component.formatLabel('in_progress')).toBe('In Progress');
    expect(component.formatLabel('purchase')).toBe('Purchase');
  });

  it('should format date strings', () => {
    const result = component.formatDate('2026-03-15');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('should format month strings', () => {
    const result = component.formatMonth('2026-03');
    expect(result).toContain('Mar');
    expect(result).toContain('2026');
  });

  it('should get low stock items from inventory stats', () => {
    expect(component.lowStockItems.length).toBe(2);
    expect(component.lowStockItems[0].item_name).toBe('Aspirin');
  });

  it('should get recent transactions from transaction stats', () => {
    expect(component.recentTransactions.length).toBe(2);
  });

  it('should return empty arrays when stats are null', () => {
    component.inventoryStats = null;
    component.transactionStats = null;
    expect(component.lowStockItems).toEqual([]);
    expect(component.recentTransactions).toEqual([]);
  });

  describe('error handling', () => {
    it('should show error when summary fails to load', async () => {
      const errorService = {
        getSummary: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
        getAppointmentStats: vi.fn().mockReturnValue(of(mockAppointmentStats)),
        getInventoryStats: vi.fn().mockReturnValue(of(mockInventoryStats)),
        getTransactionStats: vi.fn().mockReturnValue(of(mockTransactionStats)),
      };

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          provideRouter([]),
          { provide: StatisticsService, useValue: errorService },
        ],
      }).compileComponents();

      const errorFixture = TestBed.createComponent(DashboardComponent);
      const errorComponent = errorFixture.componentInstance;
      errorFixture.detectChanges();

      expect(errorComponent.error).toBe('Failed to load summary statistics.');
      expect(errorComponent.loading).toBe(false);
    });
  });
});
