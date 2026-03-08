import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PatientListComponent } from './patient-list';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPatientResponse = {
    items: [{ id: 1, gender: 'male', third_party: { name: 'John Doe', phone: '123', email: 'j@d.com' }, is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockPatientResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients on init', () => {
    expect(api.getList).toHaveBeenCalledWith('patients', expect.objectContaining({ page: 1 }));
    expect(component.patients().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadPatients();
    expect(notification.error).toHaveBeenCalledWith('Failed to load patients.');
    expect(component.table.loading()).toBe(false);
  });

  it('should pass search query to API', () => {
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockPatientResponse));
    component.searchQuery = 'John';
    component.onSearch();
    expect(api.getList).toHaveBeenCalledWith('patients', expect.objectContaining({ search: 'John' }));
    expect(component.table.currentPage()).toBe(1);
  });

  it('should pass filters to API', () => {
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockPatientResponse));
    component.filterGender.set('male');
    component.filterActive.set('true');
    component.loadPatients();
    expect(api.getList).toHaveBeenCalledWith('patients', expect.objectContaining({ gender: 'male', is_active: 'true' }));
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/patients', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/patients', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, third_party: { name: 'John Doe' } } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, third_party: { name: 'John Doe' } });
    });
  });

  it('should navigate to new patient page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createPatient();
    expect(navigateSpy).toHaveBeenCalledWith(['/patients', 'new']);
  });

  describe('delete', () => {
    it('should delete patient and reload', () => {
      component.itemToDelete.set({ id: 1, third_party: { name: 'John Doe' } });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('patients/1');
      expect(notification.success).toHaveBeenCalledWith('Patient deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1 });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete patient.');
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

  it('should format gender', () => {
    expect(component.formatGender('male')).toBe('Male');
    expect(component.formatGender('female')).toBe('Female');
    expect(component.formatGender(null)).toBe('—');
  });
});
