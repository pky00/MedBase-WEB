import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TransactionFormComponent } from './transaction-form';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 50, pages: 0 })),
      post: vi.fn().mockReturnValue(of({ id: 1 })),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TransactionFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one empty item', () => {
    expect(component.items.length).toBe(1);
  });

  it('should add items', () => {
    component.addItem();
    expect(component.items.length).toBe(2);
  });

  it('should remove items', () => {
    component.addItem();
    expect(component.items.length).toBe(2);
    component.removeItem(0);
    expect(component.items.length).toBe(1);
  });

  it('should validate required fields', () => {
    component.onSubmit();
    expect(component.errorMessage()).toBe('Transaction type is required.');

    component.transactionType = 'purchase';
    component.transactionDate = '';
    component.onSubmit();
    expect(component.errorMessage()).toBe('Transaction date is required.');
  });

  it('should validate at least one item', () => {
    component.transactionType = 'purchase';
    component.transactionDate = '2026-03-01';
    component.items = [{ item_type: '', item_id: null, quantity: 1, itemOptions: [], itemPage: 1, itemHasMore: false }];
    component.onSubmit();
    expect(component.errorMessage()).toBe('At least one item is required.');
  });

  it('should validate third party for donation', () => {
    component.transactionType = 'donation';
    component.transactionDate = '2026-03-01';
    component.items = [{ item_type: 'medicine', item_id: 1, quantity: 5, itemOptions: [], itemPage: 1, itemHasMore: false }];
    component.onSubmit();
    expect(component.errorMessage()).toContain('Donor Partner is required');
  });

  it('should submit valid form', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.transactionType = 'purchase';
    component.transactionDate = '2026-03-01';
    component.items = [{ item_type: 'medicine', item_id: 1, quantity: 5, itemOptions: [], itemPage: 1, itemHasMore: false }];
    component.onSubmit();

    expect(api.post).toHaveBeenCalledWith('inventory-transactions', expect.objectContaining({
      transaction_type: 'purchase',
      transaction_date: '2026-03-01',
      items: [{ item_type: 'medicine', item_id: 1, quantity: 5 }],
    }));
    expect(notification.success).toHaveBeenCalledWith('Transaction created successfully.');
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions', 1]);
  });

  it('should show error on submit failure', () => {
    api.post.mockReturnValue(throwError(() => ({ error: { detail: 'Server error' } })));
    component.transactionType = 'purchase';
    component.transactionDate = '2026-03-01';
    component.items = [{ item_type: 'medicine', item_id: 1, quantity: 5, itemOptions: [], itemPage: 1, itemHasMore: false }];
    component.onSubmit();

    expect(component.saving()).toBe(false);
    expect(component.errorMessage()).toBe('Server error');
  });

  it('should navigate on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions']);
  });

  it('should detect needsThirdParty', () => {
    component.transactionType = 'purchase';
    expect(component.needsThirdParty).toBe(false);
    component.transactionType = 'donation';
    expect(component.needsThirdParty).toBe(true);
    component.transactionType = 'prescription';
    expect(component.needsThirdParty).toBe(true);
  });
});
