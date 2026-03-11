import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TreatmentViewComponent } from './treatment-view';

describe('TreatmentViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockTreatment = {
    id: 1,
    patient_id: 1,
    partner_id: 2,
    appointment_id: null,
    treatment_type: 'Surgery',
    description: 'Test surgery',
    treatment_date: '2026-03-01',
    status: 'pending',
    cost: '500.00',
    notes: 'Post-op care needed',
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
      get: vi.fn().mockReturnValue(of(mockTreatment)),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TreatmentViewComponent],
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
    fixture = TestBed.createComponent(TreatmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load treatment on init', () => {
    expect(api.get).toHaveBeenCalledWith('treatments/1');
    expect(component.treatment()).toBeTruthy();
    expect(component.treatment()?.treatment_type).toBe('Surgery');
    expect(component.loading()).toBe(false);
  });

  it('should show error on load failure', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    component.loadTreatment(999);
    expect(notification.error).toHaveBeenCalledWith('Failed to load treatment.');
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments']);
  });

  it('should format status', () => {
    expect(component.formatStatus('pending')).toBe('Pending');
    expect(component.formatStatus('completed')).toBe('Completed');
    expect(component.formatStatus('in_progress')).toBe('In Progress');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-01')).toBeTruthy();
  });

  it('should format cost', () => {
    expect(component.formatCost(null)).toBe('—');
    expect(component.formatCost('500.00')).toBe('$500.00');
  });

  it('should navigate to edit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editTreatment();
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 1, 'edit']);
  });

  it('should navigate back', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments']);
  });
});
