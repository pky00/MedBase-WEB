import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DoctorViewComponent } from './doctor-view';

describe('DoctorViewComponent', () => {
  let component: DoctorViewComponent;
  let fixture: ComponentFixture<DoctorViewComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockDoctor = {
    id: 1, third_party_id: 10, third_party: { id: 10, name: 'Dr. Smith', phone: '123', email: 'dr@test.com' },
    specialization: 'General', type: 'internal' as const,
    partner_id: null, partner_name: null,
    is_active: true, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  const emptyListResponse = { items: [], total: 0, page: 1, size: 100, pages: 0 };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockDoctor)),
      getList: vi.fn().mockReturnValue(of(emptyListResponse)),
    };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DoctorViewComponent],
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
    fixture = TestBed.createComponent(DoctorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctor on init', () => {
    expect(api.get).toHaveBeenCalledWith('doctors/1');
    expect(component.doctor()).toEqual(mockDoctor);
    expect(component.loading()).toBe(false);
  });

  it('should load appointments for doctor', () => {
    expect(api.getList).toHaveBeenCalledWith('appointments', expect.objectContaining({
      doctor_id: 1,
      sort: 'appointment_date',
      order: 'desc',
    }));
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadDoctor(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load doctor.');
    expect(navigateSpy).toHaveBeenCalledWith(['/doctors']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editDoctor();
    expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 1, 'edit']);
  });

  it('should navigate back to doctors list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/doctors']);
  });

  it('should navigate to appointment view', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.viewAppointment(5);
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 5]);
  });

  it('should format doctor type', () => {
    expect(component.formatDoctorType('internal')).toBe('Internal');
    expect(component.formatDoctorType('external')).toBe('External');
    expect(component.formatDoctorType('partner_provided')).toBe('Partner Provided');
  });

  it('should format status', () => {
    expect(component.formatStatus('scheduled')).toBe('Scheduled');
    expect(component.formatStatus('completed')).toBe('Completed');
  });

  it('should format date time', () => {
    expect(component.formatDateTime(null)).toBe('—');
    expect(component.formatDateTime('2024-01-15T10:00:00')).toBeTruthy();
  });
});
