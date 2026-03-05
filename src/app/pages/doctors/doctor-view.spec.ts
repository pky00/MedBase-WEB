import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DoctorViewComponent } from './doctor-view';

describe('DoctorViewComponent', () => {
  let component: DoctorViewComponent;
  let fixture: ComponentFixture<DoctorViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockDoctor = {
    id: 1, name: 'Dr. Smith', specialization: 'General',
    phone: '123', email: 'dr@test.com', type: 'internal' as const,
    partner_id: null, partner_name: null,
    is_active: true, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockDoctor)) };
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

  it('should format doctor type', () => {
    expect(component.formatDoctorType('internal')).toBe('Internal');
    expect(component.formatDoctorType('external')).toBe('External');
    expect(component.formatDoctorType('partner_provided')).toBe('Partner Provided');
  });
});
