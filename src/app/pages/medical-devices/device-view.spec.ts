import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DeviceViewComponent } from './device-view';

describe('DeviceViewComponent', () => {
  let component: DeviceViewComponent;
  let fixture: ComponentFixture<DeviceViewComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockDevice = {
    id: 1, item_id: 30, code: 'DEV-001', name: 'Blood Pressure Monitor', description: 'Digital BP monitor',
    category_id: 1, category_name: 'Monitors', is_active: true,
    quantity: 10, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  const mockTransactionsResponse = {
    items: [
      { id: 1, transaction_type: 'purchase', third_party_id: 1, third_party_name: 'Admin', transaction_date: '2024-01-01', notes: null, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '', transaction_item: { id: 1, transaction_id: 1, item_id: 30, quantity: 10, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '', item_name: 'Blood Pressure Monitor', item_type: 'medical_device' } },
    ],
    total: 1, page: 1, size: 10, pages: 1,
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockDevice)),
      getList: vi.fn().mockReturnValue(of(mockTransactionsResponse)),
    };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DeviceViewComponent],
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
    fixture = TestBed.createComponent(DeviceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load device on init', () => {
    expect(api.get).toHaveBeenCalledWith('medical-devices/1');
    expect(component.device()).toEqual(mockDevice);
    expect(component.loading()).toBe(false);
  });

  it('should load transactions after device loads', () => {
    expect(api.getList).toHaveBeenCalledWith('inventory-transactions/by-item/30', expect.objectContaining({ page: 1, size: 10 }));
    expect(component.transactions().length).toBe(1);
    expect(component.transactionsTotal()).toBe(1);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadDevice(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load medical device.');
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editDevice();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices', 1, 'edit']);
  });

  it('should navigate back to devices list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
  });

  it('should navigate to transaction view', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.viewTransaction(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/inventory-transactions', 1]);
  });

  it('should format transaction types', () => {
    expect(component.formatTransactionType('purchase')).toBe('Purchase');
    expect(component.formatTransactionType('prescription')).toBe('Prescription');
  });

  it('should format dates', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2024-01-01')).toBeTruthy();
  });
});
