import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PartnerViewComponent } from './partner-view';

describe('PartnerViewComponent', () => {
  let component: PartnerViewComponent;
  let fixture: ComponentFixture<PartnerViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPartner = {
    id: 1, name: 'Partner A', partner_type: 'donor' as const,
    organization_type: 'NGO' as const, contact_person: 'John',
    phone: '123', email: 'a@b.com', address: '123 St',
    is_active: true, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockPartner)) };
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
});
