import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { AppointmentFlowComponent } from './appointment-flow';

describe('AppointmentFlowComponent', () => {
  let component: AppointmentFlowComponent;
  let fixture: ComponentFixture<AppointmentFlowComponent>;
  let api: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockAppointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    appointment_date: '2026-03-06T10:00:00Z',
    status: 'scheduled',
    type: 'scheduled',
    location: 'internal',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Smith',
    vital_signs: null,
    medical_record: null,
    is_deleted: false,
    created_at: '2026-03-06T10:00:00Z',
    updated_at: '2026-03-06T10:00:00Z',
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockAppointment)),
      post: vi.fn().mockReturnValue(of({})),
      put: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppointmentFlowComponent],
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
    fixture = TestBed.createComponent(AppointmentFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointment on init', () => {
    expect(api.get).toHaveBeenCalledWith('appointments/1');
    expect(component.appointment()).toEqual(mockAppointment);
    expect(component.currentStep()).toBe('overview');
  });

  it('should show error on load failure', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAppointment();
    expect(notification.error).toHaveBeenCalledWith('Failed to load appointment.');
  });

  it('should change step', () => {
    component.setStep('vitals');
    expect(component.currentStep()).toBe('vitals');
    component.setStep('record');
    expect(component.currentStep()).toBe('record');
    component.setStep('complete');
    expect(component.currentStep()).toBe('complete');
  });

  it('should begin appointment', () => {
    component.beginAppointment();
    expect(api.put).toHaveBeenCalledWith('appointments/1/status', { status: 'in_progress' });
    expect(notification.success).toHaveBeenCalledWith('Appointment started.');
  });

  it('should show error when begin fails', () => {
    api.put.mockReturnValue(throwError(() => ({ error: { detail: 'Error' } })));
    component.beginAppointment();
    expect(notification.error).toHaveBeenCalledWith('Error');
  });

  it('should save vitals (create)', () => {
    component.bpSystolic = '120';
    component.bpDiastolic = '80';
    component.heartRate = '72';
    component.saveVitals();
    expect(api.post).toHaveBeenCalledWith(
      'appointments/1/vitals',
      expect.objectContaining({ blood_pressure_systolic: 120, blood_pressure_diastolic: 80, heart_rate: 72 })
    );
    expect(notification.success).toHaveBeenCalledWith('Vital signs saved.');
  });

  it('should update vitals when existing', () => {
    const appointmentWithVitals = {
      ...mockAppointment,
      status: 'in_progress',
      vital_signs: {
        id: 10,
        appointment_id: 1,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        heart_rate: 72,
        temperature: null,
        respiratory_rate: null,
        weight: null,
        height: null,
        notes: null,
        is_deleted: false,
        created_at: '2026-03-06',
        updated_at: '2026-03-06',
      },
    };
    api.get.mockReturnValue(of(appointmentWithVitals));
    component.loadAppointment();

    component.saveVitals();
    expect(api.put).toHaveBeenCalledWith('vital-signs/10', expect.any(Object));
    expect(notification.success).toHaveBeenCalledWith('Vital signs updated.');
  });

  it('should save medical record (create)', () => {
    component.chiefComplaint = 'Headache';
    component.diagnosis = 'Migraine';
    component.saveMedicalRecord();
    expect(api.post).toHaveBeenCalledWith(
      'appointments/1/medical-record',
      expect.objectContaining({ chief_complaint: 'Headache', diagnosis: 'Migraine' })
    );
    expect(notification.success).toHaveBeenCalledWith('Medical record saved.');
  });

  it('should update medical record when existing', () => {
    const appointmentWithRecord = {
      ...mockAppointment,
      medical_record: {
        id: 20,
        appointment_id: 1,
        chief_complaint: 'Old',
        diagnosis: null,
        treatment_notes: null,
        follow_up_date: null,
        is_deleted: false,
        created_at: '2026-03-06',
        updated_at: '2026-03-06',
      },
    };
    api.get.mockReturnValue(of(appointmentWithRecord));
    component.loadAppointment();

    component.saveMedicalRecord();
    expect(api.put).toHaveBeenCalledWith('medical-records/20', expect.any(Object));
    expect(notification.success).toHaveBeenCalledWith('Medical record updated.');
  });

  it('should complete appointment', () => {
    component.completeAppointment();
    expect(api.put).toHaveBeenCalledWith('appointments/1/status', { status: 'completed' });
    expect(notification.success).toHaveBeenCalledWith('Appointment completed.');
  });

  it('should detect read-only state', () => {
    expect(component.isCompleted).toBe(false);
    expect(component.isReadOnly).toBe(false);

    const completedAppointment = { ...mockAppointment, status: 'completed' };
    api.get.mockReturnValue(of(completedAppointment));
    component.loadAppointment();
    expect(component.isCompleted).toBe(true);
    expect(component.isReadOnly).toBe(true);
  });

  it('should navigate back', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1]);
  });

  it('should navigate to appointments list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goToAppointments();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments']);
  });
});
