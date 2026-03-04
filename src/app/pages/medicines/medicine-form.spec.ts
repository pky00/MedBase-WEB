import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { MedicineFormComponent } from './medicine-form';

describe('MedicineFormComponent', () => {
  let component: MedicineFormComponent;
  let fixture: ComponentFixture<MedicineFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockCategoryResponse = {
    items: [{ id: 1, name: 'Antibiotics' }],
    total: 1,
    page: 1,
    size: 50,
    pages: 1,
  };

  function setup(paramId: string | null = null) {
    api = {
      get: vi.fn(),
      getList: vi.fn().mockReturnValue(of(mockCategoryResponse)),
      post: vi.fn(),
      put: vi.fn(),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [MedicineFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MedicineFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode', () => {
    beforeEach(() => {
      setup('new');
      fixture.detectChanges();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should load categories on init', () => {
      expect(api.getList).toHaveBeenCalledWith('medicine-categories', expect.objectContaining({ page: 1, size: 50 }));
      expect(component.categoryOptions().length).toBe(1);
    });

    it('should require name and category', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Name and category are required.');
    });

    it('should create medicine successfully', () => {
      const mockMedicine = { id: 1, name: 'Amoxicillin' };
      api.post.mockReturnValue(of(mockMedicine));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'Amoxicillin';
      component.categoryId = 1;
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('medicines', expect.objectContaining({
        name: 'Amoxicillin',
        category_id: 1,
      }));
      expect(notification.success).toHaveBeenCalledWith('Medicine created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'Amoxicillin';
      component.categoryId = 1;
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockMedicine = {
      id: 5, name: 'Ibuprofen', description: 'Pain reliever',
      category_id: 1, category_name: 'Antibiotics', is_active: true,
      quantity: 50, is_deleted: false, created_at: '', updated_at: '',
    };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockMedicine));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.medicineId).toBe(5);
    });

    it('should load medicine data', () => {
      expect(component.name).toBe('Ibuprofen');
      expect(component.categoryId).toBe(1);
    });

    it('should update medicine successfully', () => {
      api.put.mockReturnValue(of(mockMedicine));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('medicines/5', expect.objectContaining({ name: 'Ibuprofen' }));
      expect(notification.success).toHaveBeenCalledWith('Medicine updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 5]);
    });

    it('should handle load medicine error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadMedicine();

      expect(notification.error).toHaveBeenCalledWith('Failed to load medicine.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicines']);
    });
  });

  it('should update isActive on active change', () => {
    setup('new');
    fixture.detectChanges();
    component.onActiveChange({ target: { value: 'false' } } as unknown as Event);
    expect(component.isActive).toBe(false);
  });

  it('should navigate back on cancel', () => {
    setup('new');
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/medicines']);
  });
});
