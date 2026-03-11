import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TreatmentFormComponent } from './treatment-form';

describe('TreatmentFormComponent', () => {
  let component: TreatmentFormComponent;
  let fixture: ComponentFixture<TreatmentFormComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 50, pages: 0 })),
      get: vi.fn().mockReturnValue(of({})),
      post: vi.fn().mockReturnValue(of({ id: 1 })),
      put: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TreatmentFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TreatmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode by default', () => {
    expect(component.isEdit()).toBe(false);
  });

  it('should validate required fields', () => {
    component.onSubmit();
    expect(component.errorMessage()).toBe('Patient is required.');

    component.patientId = 1;
    component.onSubmit();
    expect(component.errorMessage()).toBe('Partner is required.');

    component.partnerId = 1;
    component.onSubmit();
    expect(component.errorMessage()).toBe('Treatment type is required.');
  });

  it('should submit valid create form', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.patientId = 1;
    component.partnerId = 2;
    component.treatmentType = 'Surgery';
    component.treatmentDate = '2026-03-01';
    component.onSubmit();

    expect(api.post).toHaveBeenCalledWith('treatments', expect.objectContaining({
      patient_id: 1,
      partner_id: 2,
      treatment_type: 'Surgery',
    }));
    expect(notification.success).toHaveBeenCalledWith('Treatment created successfully.');
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 1]);
  });

  it('should show error on submit failure', () => {
    api.post.mockReturnValue(throwError(() => ({ error: { detail: 'Server error' } })));
    component.patientId = 1;
    component.partnerId = 2;
    component.treatmentType = 'Surgery';
    component.onSubmit();

    expect(component.saving()).toBe(false);
    expect(component.errorMessage()).toBe('Server error');
  });

  it('should navigate on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments']);
  });
});

describe('TreatmentFormComponent (edit mode)', () => {
  let component: TreatmentFormComponent;
  let fixture: ComponentFixture<TreatmentFormComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockTreatment = {
    id: 1,
    patient_id: 1,
    partner_id: 2,
    appointment_id: null,
    treatment_type: 'Surgery',
    description: 'Test',
    treatment_date: '2026-03-01',
    status: 'pending',
    cost: '100.00',
    notes: 'Notes',
    is_deleted: false,
    created_by: 'admin',
    created_at: '2026-03-01T10:00:00',
    updated_by: null,
    updated_at: '2026-03-01T10:00:00',
    patient_name: 'John Doe',
    partner_name: 'Hospital A',
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 50, pages: 0 })),
      get: vi.fn().mockReturnValue(of(mockTreatment)),
      post: vi.fn().mockReturnValue(of({ id: 1 })),
      put: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TreatmentFormComponent],
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
    fixture = TestBed.createComponent(TreatmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be in edit mode', () => {
    expect(component.isEdit()).toBe(true);
  });

  it('should load treatment data', () => {
    expect(api.get).toHaveBeenCalledWith('treatments/1');
    expect(component.treatmentType).toBe('Surgery');
    expect(component.patientId).toBe(1);
    expect(component.partnerId).toBe(2);
  });

  it('should submit update', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onSubmit();

    expect(api.put).toHaveBeenCalledWith('treatments/1', expect.objectContaining({
      patient_id: 1,
      partner_id: 2,
      treatment_type: 'Surgery',
    }));
    expect(notification.success).toHaveBeenCalledWith('Treatment updated successfully.');
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 1]);
  });
});
