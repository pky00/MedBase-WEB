import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { EquipmentListComponent } from './equipment-list';

describe('EquipmentListComponent', () => {
  let component: EquipmentListComponent;
  let fixture: ComponentFixture<EquipmentListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockEquipmentResponse = {
    items: [{ id: 1, name: 'X-Ray Machine', category_name: 'Imaging', condition: 'good', quantity: 2, is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  const mockCategoryResponse = {
    items: [{ id: 1, name: 'Imaging' }],
    total: 1,
    page: 1,
    size: 50,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockImplementation((endpoint: string) => {
        if (endpoint === 'equipment-categories') return of(mockCategoryResponse);
        return of(mockEquipmentResponse);
      }),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EquipmentListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(EquipmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipment on init', () => {
    expect(api.getList).toHaveBeenCalledWith('equipment', expect.objectContaining({ page: 1 }));
    expect(component.equipmentItems().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should load categories on init', () => {
    expect(api.getList).toHaveBeenCalledWith('equipment-categories', expect.objectContaining({ page: 1, size: 50 }));
    expect(component.categoryOptions().length).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadEquipment();
    expect(notification.error).toHaveBeenCalledWith('Failed to load equipment.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, name: 'X-Ray Machine' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, name: 'X-Ray Machine' });
    });
  });

  it('should navigate to new equipment page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createEquipment();
    expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 'new']);
  });

  describe('delete', () => {
    it('should delete equipment and reload', () => {
      component.itemToDelete.set({ id: 1, name: 'X-Ray Machine' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('equipment/1');
      expect(notification.success).toHaveBeenCalledWith('Equipment deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1, name: 'X-Ray Machine' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete equipment. Inventory quantity must be 0.');
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
});
