import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { CategoryListComponent } from './category-list';

describe('MedicalDeviceCategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [{ id: 1, name: 'Monitors', description: 'Patient monitors' }],
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
      imports: [CategoryListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(api.getList).toHaveBeenCalledWith('medical-device-categories', expect.objectContaining({ page: 1 }));
    expect(component.categories().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadCategories();
    expect(notification.error).toHaveBeenCalledWith('Failed to load medical device categories.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, name: 'Monitors' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.categoryToDelete()).toEqual({ id: 1, name: 'Monitors' });
    });
  });

  it('should navigate to new category page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createCategory();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories', 'new']);
  });

  describe('delete', () => {
    it('should delete category and reload', () => {
      component.categoryToDelete.set({ id: 1, name: 'Monitors' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('medical-device-categories/1');
      expect(notification.success).toHaveBeenCalledWith('Medical device category deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.categoryToDelete.set({ id: 1, name: 'Monitors' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete category. It may have linked medical devices.');
      expect(component.deleting()).toBe(false);
    });

    it('should not delete when no category selected', () => {
      component.categoryToDelete.set(null);
      component.confirmDelete();
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  it('should cancel delete', () => {
    component.deleteModalOpen.set(true);
    component.categoryToDelete.set({ id: 1 });
    component.cancelDelete();
    expect(component.deleteModalOpen()).toBe(false);
    expect(component.categoryToDelete()).toBeNull();
  });
});
