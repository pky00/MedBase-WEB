import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { AppointmentViewComponent } from './appointment-view';

describe('AppointmentViewComponent', () => {
  let component: AppointmentViewComponent;
  let fixture: ComponentFixture<AppointmentViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockAppointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    partner_id: null,
    appointment_date: '2026-03-06T10:00:00Z',
    status: 'scheduled',
    type: 'scheduled',
    location: 'internal',
    notes: 'Test',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Smith',
    partner_name: null,
    vital_signs: null,
    medical_record: null,
    is_deleted: false,
    created_at: '2026-03-06T10:00:00Z',
    updated_at: '2026-03-06T10:00:00Z',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockAppointment)) };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppointmentViewComponent],
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
    fixture = TestBed.createComponent(AppointmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointment on init', () => {
    expect(api.get).toHaveBeenCalledWith('appointments/1');
    expect(component.appointment()).toEqual(mockAppointment);
    expect(component.loading()).toBe(false);
  });

  it('should show error on load failure', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAppointment();
    expect(notification.error).toHaveBeenCalledWith('Failed to load appointment.');
    expect(component.loading()).toBe(false);
  });

  it('should format status', () => {
    expect(component.formatStatus('scheduled')).toBe('Scheduled');
    expect(component.formatStatus('in_progress')).toBe('In Progress');
    expect(component.formatStatus('completed')).toBe('Completed');
    expect(component.formatStatus('cancelled')).toBe('Cancelled');
  });

  it('should format type', () => {
    expect(component.formatType('scheduled')).toBe('Scheduled');
    expect(component.formatType('walk_in')).toBe('Walk-in');
  });

  it('should format location', () => {
    expect(component.formatLocation('internal')).toBe('Internal');
    expect(component.formatLocation('external')).toBe('External');
  });

  it('should navigate to edit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editAppointment();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1, 'edit']);
  });

  it('should navigate to flow', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.processAppointment();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1, 'flow']);
  });

  it('should navigate back', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments']);
  });
});
