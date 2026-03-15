import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { EquipmentViewComponent } from './equipment-view';

describe('EquipmentViewComponent', () => {
  let component: EquipmentViewComponent;
  let fixture: ComponentFixture<EquipmentViewComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockEquipment = {
    id: 1, item_id: 20, code: 'EQ-001', name: 'X-Ray Machine', description: 'Digital X-Ray',
    category_id: 1, category_name: 'Imaging', condition: 'good',
    is_active: true, quantity: 2, is_deleted: false,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  const mockTransactionsResponse = {
    items: [
      { id: 1, transaction_type: 'purchase', third_party_id: 1, third_party_name: 'Admin', transaction_date: '2024-01-01', notes: null, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '', transaction_item: { id: 1, transaction_id: 1, item_id: 20, quantity: 2, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '', item_name: 'X-Ray Machine', item_type: 'equipment' } },
    ],
    total: 1, page: 1, size: 10, pages: 1,
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockEquipment)),
      getList: vi.fn().mockReturnValue(of(mockTransactionsResponse)),
    };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EquipmentViewComponent],
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
    fixture = TestBed.createComponent(EquipmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipment on init', () => {
    expect(api.get).toHaveBeenCalledWith('equipment/1');
    expect(component.equipment()).toEqual(mockEquipment);
    expect(component.loading()).toBe(false);
  });

  it('should load transactions after equipment loads', () => {
    expect(api.getList).toHaveBeenCalledWith('inventory-transactions/by-item/20', expect.objectContaining({ page: 1, size: 10 }));
    expect(component.transactions().length).toBe(1);
    expect(component.transactionsTotal()).toBe(1);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadEquipment(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load equipment.');
    expect(navigateSpy).toHaveBeenCalledWith(['/equipment']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editEquipment();
    expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 1, 'edit']);
  });

  it('should navigate back to equipment list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/equipment']);
  });

  it('should navigate to transaction view', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.viewTransaction(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions', 1]);
  });

  it('should format transaction types', () => {
    expect(component.formatTransactionType('purchase')).toBe('Purchase');
    expect(component.formatTransactionType('donation')).toBe('Donation');
  });

  it('should format dates', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2024-01-01')).toBeTruthy();
  });
});
