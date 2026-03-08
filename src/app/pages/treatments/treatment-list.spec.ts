import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { TreatmentListComponent } from './treatment-list';

describe('TreatmentListComponent', () => {
  let component: TreatmentListComponent;
  let fixture: ComponentFixture<TreatmentListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [
      { id: 1, patient_name: 'John Doe', partner_name: 'Hospital A', treatment_type: 'Surgery', treatment_date: '2026-03-01', status: 'pending' },
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
      imports: [TreatmentListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TreatmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load treatments on init', () => {
    expect(api.getList).toHaveBeenCalledWith('treatments', expect.objectContaining({ page: 1 }));
    expect(component.treatments().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadTreatments();
    expect(notification.error).toHaveBeenCalledWith('Failed to load treatments.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1 } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1 });
    });
  });

  it('should navigate to new treatment page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createTreatment();
    expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 'new']);
  });

  describe('delete', () => {
    it('should delete treatment and reload', () => {
      component.itemToDelete.set({ id: 1 });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('treatments/1');
      expect(notification.success).toHaveBeenCalledWith('Treatment deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1 });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete treatment.');
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

  it('should format status', () => {
    expect(component.formatStatus('pending')).toBe('Pending');
    expect(component.formatStatus('completed')).toBe('Completed');
  });

  it('should format date', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-01')).toBeTruthy();
  });
});
