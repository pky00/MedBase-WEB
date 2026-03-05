import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { MedicineListComponent } from './medicine-list';

describe('MedicineListComponent', () => {
  let component: MedicineListComponent;
  let fixture: ComponentFixture<MedicineListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockMedicineResponse = {
    items: [{ id: 1, name: 'Amoxicillin', category_name: 'Antibiotics', quantity: 100, is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  const mockCategoryResponse = {
    items: [{ id: 1, name: 'Antibiotics' }],
    total: 1,
    page: 1,
    size: 50,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockImplementation((endpoint: string) => {
        if (endpoint === 'medicine-categories') return of(mockCategoryResponse);
        return of(mockMedicineResponse);
      }),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MedicineListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MedicineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load medicines on init', () => {
    expect(api.getList).toHaveBeenCalledWith('medicines', expect.objectContaining({ page: 1 }));
    expect(component.medicines().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should load categories on init', () => {
    expect(api.getList).toHaveBeenCalledWith('medicine-categories', expect.objectContaining({ page: 1, size: 50 }));
    expect(component.categoryOptions().length).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadMedicines();
    expect(notification.error).toHaveBeenCalledWith('Failed to load medicines.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, name: 'Amoxicillin' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, name: 'Amoxicillin' });
    });
  });

  it('should navigate to new medicine page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createMedicine();
    expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 'new']);
  });

  describe('delete', () => {
    it('should delete medicine and reload', () => {
      component.itemToDelete.set({ id: 1, name: 'Amoxicillin' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('medicines/1');
      expect(notification.success).toHaveBeenCalledWith('Medicine deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1, name: 'Amoxicillin' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete medicine. Inventory quantity must be 0.');
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

  it('should filter by category', () => {
    component.onCategoryChange(1);
    expect(component.filterCategory()).toBe('1');
    expect(component.table.currentPage()).toBe(1);
  });

  it('should clear category filter', () => {
    component.filterCategory.set('1');
    component.onCategoryChange(null);
    expect(component.filterCategory()).toBe('');
  });
});
