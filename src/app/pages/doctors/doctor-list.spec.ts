import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DoctorListComponent } from './doctor-list';

describe('DoctorListComponent', () => {
  let component: DoctorListComponent;
  let fixture: ComponentFixture<DoctorListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockDoctorResponse = {
    items: [{ id: 1, third_party: { name: 'Dr. Smith' }, specialization: 'General', type: 'internal', is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockDoctorResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DoctorListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DoctorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctors on init', () => {
    expect(api.getList).toHaveBeenCalledWith('doctors', expect.objectContaining({ page: 1 }));
    expect(component.doctors().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadDoctors();
    expect(notification.error).toHaveBeenCalledWith('Failed to load doctors.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, name: 'Dr. Smith' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, name: 'Dr. Smith' });
    });
  });

  it('should navigate to new doctor page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createDoctor();
    expect(navigateSpy).toHaveBeenCalledWith(['/doctors', 'new']);
  });

  describe('delete', () => {
    it('should delete doctor and reload', () => {
      component.itemToDelete.set({ id: 1, name: 'Dr. Smith' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('doctors/1');
      expect(notification.success).toHaveBeenCalledWith('Doctor deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1, name: 'Dr. Smith' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete doctor.');
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

  it('should format doctor type', () => {
    expect(component.formatDoctorType('internal')).toBe('Internal');
    expect(component.formatDoctorType('external')).toBe('External');
    expect(component.formatDoctorType('partner_provided')).toBe('Partner Provided');
  });
});
