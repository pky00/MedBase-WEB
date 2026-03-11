import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TransactionViewComponent } from './transaction-view';

describe('TransactionViewComponent', () => {
  let component: TransactionViewComponent;
  let fixture: ComponentFixture<TransactionViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockTransaction = {
    id: 1,
    transaction_type: 'purchase',
    third_party_id: 1,
    third_party_name: 'Admin User',
    transaction_date: '2026-03-01',
    notes: 'Test notes',
    is_deleted: false,
    created_by: 'admin',
    created_at: '2026-03-01T10:00:00',
    updated_by: null,
    updated_at: '2026-03-01T10:00:00',
    items: [
      { id: 1, transaction_id: 1, item_type: 'medicine', item_id: 1, quantity: 10, item_name: 'Aspirin', is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '' },
    ],
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockTransaction)),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TransactionViewComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TransactionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transaction on init', () => {
    expect(api.get).toHaveBeenCalledWith('inventory-transactions/1');
    expect(component.transaction()).toBeTruthy();
    expect(component.transaction()?.transaction_type).toBe('purchase');
    expect(component.loading()).toBe(false);
  });

  it('should show error on load failure', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    component.loadTransaction(999);
    expect(notification.error).toHaveBeenCalledWith('Failed to load transaction.');
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions']);
  });

  it('should format transaction type', () => {
    expect(component.formatTransactionType('purchase')).toBe('Purchase');
    expect(component.formatTransactionType('donation')).toBe('Donation');
  });

  it('should format item type', () => {
    expect(component.formatItemType('medicine')).toBe('Medicine');
    expect(component.formatItemType('equipment')).toBe('Equipment');
    expect(component.formatItemType('medical_device')).toBe('Medical Device');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-01')).toBeTruthy();
  });

  it('should navigate back', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions']);
  });
});
