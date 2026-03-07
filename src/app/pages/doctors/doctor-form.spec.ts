import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DoctorFormComponent } from './doctor-form';

describe('DoctorFormComponent', () => {
  let component: DoctorFormComponent;
  let fixture: ComponentFixture<DoctorFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPartnerResponse = {
    items: [{ id: 1, name: 'Partner A' }],
    total: 1, page: 1, size: 50, pages: 1,
  };

  const mockThirdPartyResponse = {
    items: [{ id: 1, name: 'TP A' }],
    total: 1, page: 1, size: 50, pages: 1,
  };

  function setup(paramId: string | null = null) {
    api = {
      get: vi.fn(),
      getList: vi.fn().mockImplementation((endpoint: string) => {
        if (endpoint === 'partners') return of(mockPartnerResponse);
        if (endpoint === 'third-parties') return of(mockThirdPartyResponse);
        return of(mockPartnerResponse);
      }),
      post: vi.fn(),
      put: vi.fn(),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [DoctorFormComponent],
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
    fixture = TestBed.createComponent(DoctorFormComponent);
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

    it('should load partners on init', () => {
      expect(api.getList).toHaveBeenCalledWith('partners', expect.objectContaining({ page: 1, size: 50 }));
      expect(component.partnerOptions().length).toBe(1);
    });

    it('should load third parties on init in create mode', () => {
      expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ page: 1, size: 50 }));
      expect(component.thirdPartyOptions().length).toBe(1);
    });

    it('should require name and type', () => {
      component.name = '';
      component.onSubmit();
      expect(component.errorMessage()).toBe('Name and type are required.');
    });

    it('should require partner for partner_provided type', () => {
      component.name = 'Dr. Test';
      component.doctorType = 'partner_provided';
      component.partnerId = null;
      component.onSubmit();
      expect(component.errorMessage()).toBe('Partner is required for partner-provided doctors.');
    });

    it('should create doctor successfully', () => {
      const mockDoctor = { id: 1, name: 'Dr. Test' };
      api.post.mockReturnValue(of(mockDoctor));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'Dr. Test';
      component.doctorType = 'internal';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('doctors', expect.objectContaining({
        name: 'Dr. Test',
        type: 'internal',
      }));
      expect(notification.success).toHaveBeenCalledWith('Doctor created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 1]);
    });

    it('should include third_party_id when selected', () => {
      const mockDoctor = { id: 1, name: 'Dr. Test' };
      api.post.mockReturnValue(of(mockDoctor));

      component.name = 'Dr. Test';
      component.doctorType = 'internal';
      component.thirdPartyId = 5;
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('doctors', expect.objectContaining({
        third_party_id: 5,
      }));
    });

    it('should auto-fill on third party selection', () => {
      const mockTp = { id: 5, name: 'TP Name', phone: '123', email: 'tp@test.com' };
      api.get.mockReturnValue(of(mockTp));

      component.onThirdPartySelected(5);

      expect(api.get).toHaveBeenCalledWith('third-parties/5');
      expect(component.name).toBe('TP Name');
      expect(component.phone).toBe('123');
      expect(component.email).toBe('tp@test.com');
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'Dr. Test';
      component.doctorType = 'internal';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockDoctor = {
      id: 5, name: 'Dr. Smith', specialization: 'General',
      phone: '123', email: 'dr@test.com', type: 'external' as const,
      partner_id: null, partner_name: null,
      is_active: true, is_deleted: false, created_at: '', updated_at: '',
    };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockDoctor));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.doctorId).toBe(5);
    });

    it('should load doctor data', () => {
      expect(component.name).toBe('Dr. Smith');
      expect(component.doctorType).toBe('external');
      expect(component.specialization).toBe('General');
    });

    it('should not load third parties in edit mode', () => {
      expect(api.getList).not.toHaveBeenCalledWith('third-parties', expect.anything());
    });

    it('should update doctor successfully', () => {
      api.put.mockReturnValue(of(mockDoctor));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('doctors/5', expect.objectContaining({ name: 'Dr. Smith' }));
      expect(notification.success).toHaveBeenCalledWith('Doctor updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 5]);
    });

    it('should handle load doctor error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadDoctor();

      expect(notification.error).toHaveBeenCalledWith('Failed to load doctor.');
      expect(navigateSpy).toHaveBeenCalledWith(['/doctors']);
    });
  });

  it('should update doctorType on change', () => {
    setup('new');
    fixture.detectChanges();
    component.onTypeChange({ target: { value: 'external' } } as unknown as Event);
    expect(component.doctorType).toBe('external');
  });

  it('should clear partnerId when type is not partner_provided', () => {
    setup('new');
    fixture.detectChanges();
    component.partnerId = 1;
    component.onTypeChange({ target: { value: 'internal' } } as unknown as Event);
    expect(component.partnerId).toBeNull();
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
    expect(navigateSpy).toHaveBeenCalledWith(['/doctors']);
  });

  it('should load more partners', () => {
    setup('new');
    fixture.detectChanges();
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockPartnerResponse));
    component.onPartnerLoadMore();
    expect(component.partnerPage).toBe(2);
    expect(api.getList).toHaveBeenCalledWith('partners', expect.objectContaining({ page: 2, size: 50 }));
  });

  it('should search partners', () => {
    setup('new');
    fixture.detectChanges();
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockPartnerResponse));
    component.onPartnerSearch('test');
    expect(component.partnerPage).toBe(1);
    expect(api.getList).toHaveBeenCalledWith('partners', expect.objectContaining({ search: 'test' }));
  });

  it('should search third parties', () => {
    setup('new');
    fixture.detectChanges();
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockThirdPartyResponse));
    component.onThirdPartySearch('test');
    expect(component.thirdPartyPage).toBe(1);
    expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ search: 'test' }));
  });

  it('should load more third parties', () => {
    setup('new');
    fixture.detectChanges();
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockThirdPartyResponse));
    component.onThirdPartyLoadMore();
    expect(component.thirdPartyPage).toBe(2);
    expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ page: 2 }));
  });
});
