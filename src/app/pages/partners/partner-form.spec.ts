import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PartnerFormComponent } from './partner-form';

describe('PartnerFormComponent', () => {
  let component: PartnerFormComponent;
  let fixture: ComponentFixture<PartnerFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  function setup(paramId: string | null = null) {
    api = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PartnerFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PartnerFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode', () => {
    beforeEach(() => {
      setup('new');
      fixture.detectChanges();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require name and partner type', () => {
      component.name = '';
      component.onSubmit();
      expect(component.errorMessage()).toBe('Name and partner type are required.');
    });

    it('should create partner successfully', () => {
      const mockPartner = { id: 1, name: 'Partner A' };
      api.post.mockReturnValue(of(mockPartner));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'Partner A';
      component.partnerType = 'donor';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('partners', expect.objectContaining({
        name: 'Partner A',
        partner_type: 'donor',
      }));
      expect(notification.success).toHaveBeenCalledWith('Partner created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/partners', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'Partner A';
      component.partnerType = 'donor';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockPartner = {
      id: 5, name: 'Partner B', partner_type: 'referral' as const,
      organization_type: 'hospital' as const, contact_person: 'John',
      phone: '123', email: 'a@b.com', address: '123 St',
      is_active: true, is_deleted: false, created_at: '', updated_at: '',
    };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockPartner));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.partnerId).toBe(5);
    });

    it('should load partner data', () => {
      expect(component.name).toBe('Partner B');
      expect(component.partnerType).toBe('referral');
      expect(component.organizationType).toBe('hospital');
    });

    it('should update partner successfully', () => {
      api.put.mockReturnValue(of(mockPartner));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('partners/5', expect.objectContaining({ name: 'Partner B' }));
      expect(notification.success).toHaveBeenCalledWith('Partner updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/partners', 5]);
    });

    it('should handle load partner error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadPartner();

      expect(notification.error).toHaveBeenCalledWith('Failed to load partner.');
      expect(navigateSpy).toHaveBeenCalledWith(['/partners']);
    });
  });

  it('should update partnerType on change', () => {
    setup('new');
    fixture.detectChanges();
    component.onPartnerTypeChange({ target: { value: 'referral' } } as unknown as Event);
    expect(component.partnerType).toBe('referral');
  });

  it('should update organizationType on change', () => {
    setup('new');
    fixture.detectChanges();
    component.onOrgTypeChange({ target: { value: 'hospital' } } as unknown as Event);
    expect(component.organizationType).toBe('hospital');
  });

  it('should clear organizationType on empty change', () => {
    setup('new');
    fixture.detectChanges();
    component.organizationType = 'hospital' as any;
    component.onOrgTypeChange({ target: { value: '' } } as unknown as Event);
    expect(component.organizationType).toBeNull();
  });

  it('should update isActive on active change', () => {
    setup('new');
    fixture.detectChanges();
    component.onActiveChange({ target: { value: 'false' } } as unknown as Event);
    expect(component.isActive).toBe(false);
  });

  it('should navigate back on cancel', () => {
    setup('new');
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/partners']);
  });
});
