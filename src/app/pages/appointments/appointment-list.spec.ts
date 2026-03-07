import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { AppointmentListComponent } from './appointment-list';

describe('AppointmentListComponent', () => {
  let component: AppointmentListComponent;
  let fixture: ComponentFixture<AppointmentListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 2,
        appointment_date: '2026-03-06T10:00:00',
        status: 'scheduled',
        type: 'scheduled',
        location: 'internal',
        patient_name: 'John Doe',
        doctor_name: 'Dr. Smith',
        partner_name: null,
      },
    ],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppointmentListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    expect(api.getList).toHaveBeenCalledWith('appointments', expect.objectContaining({ page: 1 }));
    expect(component.appointments().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAppointments();
    expect(notification.error).toHaveBeenCalledWith('Failed to load appointments.');
    expect(component.table.loading()).toBe(false);
  });

  it('should pass filters to API', () => {
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockResponse));
    component.filterStatus.set('scheduled');
    component.filterType.set('walk_in');
    component.filterLocation.set('internal');
    component.loadAppointments();
    expect(api.getList).toHaveBeenCalledWith(
      'appointments',
      expect.objectContaining({ status: 'scheduled', type: 'walk_in', location: 'internal' })
    );
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1, 'edit']);
    });

    it('should navigate to flow on process action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'process', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 1, 'flow']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, patient_name: 'John' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, patient_name: 'John' });
    });
  });

  it('should navigate to new appointment page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createAppointment();
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 'new']);
  });

  describe('delete', () => {
    it('should delete appointment and reload', () => {
      component.itemToDelete.set({ id: 1, patient_name: 'John' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('appointments/1');
      expect(notification.success).toHaveBeenCalledWith('Appointment deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1, patient_name: 'John' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete appointment.');
      expect(component.deleting()).toBe(false);
    });

    it('should not delete when no item selected', () => {
      component.itemToDelete.set(null);
      component.confirmDelete();
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  it('should cancel delete', () => {
    component.deleteModalOpen.set(true);
    component.itemToDelete.set({ id: 1 });
    component.cancelDelete();
    expect(component.deleteModalOpen()).toBe(false);
    expect(component.itemToDelete()).toBeNull();
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-06T10:00:00')).toBeTruthy();
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
});
