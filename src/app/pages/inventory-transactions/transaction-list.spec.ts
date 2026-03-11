import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TransactionListComponent } from './transaction-list';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [
      { id: 1, transaction_type: 'purchase', third_party_name: 'User A', transaction_date: '2026-03-01', notes: null },
    ],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transactions on init', () => {
    expect(api.getList).toHaveBeenCalledWith('inventory-transactions', expect.objectContaining({ page: 1 }));
    expect(component.transactions().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadTransactions();
    expect(notification.error).toHaveBeenCalledWith('Failed to load transactions.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions', 1]);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1 } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1 });
    });
  });

  it('should navigate to new transaction page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createTransaction();
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions', 'new']);
  });

  describe('delete', () => {
    it('should delete transaction and reload', () => {
      component.itemToDelete.set({ id: 1 });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('inventory-transactions/1');
      expect(notification.success).toHaveBeenCalledWith('Transaction deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1 });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete transaction.');
      expect(component.deleting()).toBe(false);
    });

    it('should not delete when no item selected', () => {
      component.itemToDelete.set(null);
      component.confirmDelete();
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  it('should cancel delete', () => {
    component.deleteModalOpen.set(true);
    component.itemToDelete.set({ id: 1 });
    component.cancelDelete();
    expect(component.deleteModalOpen()).toBe(false);
    expect(component.itemToDelete()).toBeNull();
  });

  it('should format transaction type', () => {
    expect(component.formatTransactionType('purchase')).toBe('Purchase');
    expect(component.formatTransactionType('donation')).toBe('Donation');
    expect(component.formatTransactionType('prescription')).toBe('Prescription');
    expect(component.formatTransactionType('loss')).toBe('Loss');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-01')).toBeTruthy();
  });

  it('should format notes', () => {
    expect(component.formatNotes(null)).toBe('—');
    expect(component.formatNotes('short note')).toBe('short note');
    expect(component.formatNotes('a'.repeat(60))).toContain('...');
  });
});
