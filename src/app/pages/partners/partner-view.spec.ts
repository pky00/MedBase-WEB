import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PartnerViewComponent } from './partner-view';

describe('PartnerViewComponent', () => {
  let component: PartnerViewComponent;
  let fixture: ComponentFixture<PartnerViewComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPartner = {
    id: 1, third_party_id: 10, third_party: { id: 10, name: 'Partner A', phone: '123', email: 'a@b.com' },
    partner_type: 'both' as const,
    organization_type: 'NGO' as const, contact_person: 'John',
    address: '123 St',
    is_active: true, is_deleted: false,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  const emptyListResponse = { items: [], total: 0, page: 1, size: 100, pages: 0 };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockPartner)),
      getList: vi.fn().mockReturnValue(of(emptyListResponse)),
    };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PartnerViewComponent],
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
    fixture = TestBed.createComponent(PartnerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partner on init', () => {
    expect(api.get).toHaveBeenCalledWith('partners/1');
    expect(component.partner()).toEqual(mockPartner);
    expect(component.loading()).toBe(false);
  });

  it('should load appointments for partner', () => {
    expect(api.getList).toHaveBeenCalledWith('appointments', expect.objectContaining({
      partner_id: 1,
    }));
  });

  it('should load donations for donor-type partner', () => {
    expect(api.getList).toHaveBeenCalledWith('inventory-transactions', expect.objectContaining({
      third_party_id: 10,
      transaction_type: 'donation',
    }));
  });

  it('should load treatments for referral-type partner', () => {
    expect(api.getList).toHaveBeenCalledWith('treatments', expect.objectContaining({
      partner_id: 1,
    }));
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadPartner(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load partner.');
    expect(navigateSpy).toHaveBeenCalledWith(['/partners']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editPartner();
    expect(navigateSpy).toHaveBeenCalledWith(['/partners', 1, 'edit']);
  });

  it('should navigate back to partners list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/partners']);
  });

  it('should navigate to appointment view', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.viewAppointment(5);
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 5]);
  });

  it('should switch tabs', () => {
    expect(component.activeTab()).toBe('appointments');
    component.setTab('donations');
    expect(component.activeTab()).toBe('donations');
    component.setTab('treatments');
    expect(component.activeTab()).toBe('treatments');
  });

  it('should identify donor type', () => {
    expect(component.isDonorType()).toBe(true);
  });

  it('should identify referral type', () => {
    expect(component.isReferralType()).toBe(true);
  });

  it('should format partner type', () => {
    expect(component.formatPartnerType('donor')).toBe('Donor');
    expect(component.formatPartnerType('referral')).toBe('Referral');
    expect(component.formatPartnerType('both')).toBe('Both');
  });

  it('should format organization type', () => {
    expect(component.formatOrgType('NGO')).toBe('NGO');
    expect(component.formatOrgType('hospital')).toBe('Hospital');
    expect(component.formatOrgType(null)).toBe('—');
  });

  it('should format status', () => {
    expect(component.formatStatus('completed')).toBe('Completed');
    expect(component.formatStatus('pending')).toBe('Pending');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2024-01-15')).toBeTruthy();
  });

  it('should format date time', () => {
    expect(component.formatDateTime(null)).toBe('—');
    expect(component.formatDateTime('2024-01-15T10:00:00')).toBeTruthy();
  });
});
