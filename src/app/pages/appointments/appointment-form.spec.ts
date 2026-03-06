import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { AppointmentFormComponent } from './appointment-form';

describe('AppointmentFormComponent', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let api: {
    getList: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const emptyListResponse = { items: [], total: 0, page: 1, size: 50, pages: 0 };

  function setup(routeParams: Record<string, string> = {}) {
    api = {
      getList: vi.fn().mockReturnValue(of(emptyListResponse)),
      get: vi.fn().mockReturnValue(of({})),
      post: vi.fn().mockReturnValue(of({ id: 1 })),
      put: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [AppointmentFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => routeParams[key] || null } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppointmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('create mode', () => {
    beforeEach(() => setup());

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should load dropdown options', () => {
      // Patients, doctors, partners
      expect(api.getList).toHaveBeenCalledWith('patients', expect.any(Object));
      expect(api.getList).toHaveBeenCalledWith('doctors', expect.any(Object));
      expect(api.getList).toHaveBeenCalledWith('partners', expect.any(Object));
    });

    it('should require patient and date', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Patient is required.');
      expect(api.post).not.toHaveBeenCalled();
    });

    it('should require date when patient is set', () => {
      component.patientId = 1;
      component.onSubmit();
      expect(component.errorMessage()).toBe('Appointment date is required.');
    });

    it('should create appointment', () => {
      component.patientId = 1;
      component.appointmentDate = '2026-03-06T10:00';
      component.appointmentType = 'scheduled';
      component.location = 'internal';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith(
        'appointments',
        expect.objectContaining({ patient_id: 1, type: 'scheduled', location: 'internal' })
      );
      expect(notification.success).toHaveBeenCalledWith('Appointment created successfully.');
    });

    it('should show error on create failure', () => {
      api.post.mockReturnValue(throwError(() => ({ error: { detail: 'Server error' } })));
      component.patientId = 1;
      component.appointmentDate = '2026-03-06T10:00';
      component.onSubmit();
      expect(component.errorMessage()).toBe('Server error');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      setup({ id: '5' });
      api.get.mockReturnValue(
        of({
          id: 5,
          patient_id: 1,
          doctor_id: 2,
          partner_id: null,
          appointment_date: '2026-03-06T10:00:00Z',
          type: 'walk_in',
          location: 'internal',
          notes: 'Test',
          patient_name: 'John Doe',
          doctor_name: 'Dr. Smith',
          partner_name: null,
        })
      );
      component.ngOnInit();
    });

    it('should set edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.appointmentId).toBe(5);
    });

    it('should update appointment', () => {
      component.patientId = 1;
      component.appointmentDate = '2026-03-06T10:00';
      component.onSubmit();
      expect(api.put).toHaveBeenCalledWith('appointments/5', expect.objectContaining({ patient_id: 1 }));
    });
  });

  it('should navigate on cancel', () => {
    setup();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments']);
  });
});
