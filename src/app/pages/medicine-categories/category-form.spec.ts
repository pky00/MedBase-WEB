import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { CategoryFormComponent } from './category-form';

describe('MedicineCategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  function setup(paramId: string | null = null) {
    api = { get: vi.fn(), post: vi.fn(), put: vi.fn() };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [CategoryFormComponent],
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
    fixture = TestBed.createComponent(CategoryFormComponent);
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

    it('should require name', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Name is required.');
    });

    it('should create category successfully', () => {
      api.post.mockReturnValue(of({ id: 1, name: 'Antibiotics' }));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'Antibiotics';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('medicine-categories', expect.objectContaining({ name: 'Antibiotics' }));
      expect(notification.success).toHaveBeenCalledWith('Category created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicine-categories']);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'Antibiotics';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockCategory = { id: 5, name: 'Vitamins', description: 'Vitamin supplements' };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockCategory));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.categoryId).toBe(5);
    });

    it('should load category data', () => {
      expect(component.name).toBe('Vitamins');
      expect(component.description).toBe('Vitamin supplements');
    });

    it('should update category successfully', () => {
      api.put.mockReturnValue(of(mockCategory));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('medicine-categories/5', expect.objectContaining({ name: 'Vitamins' }));
      expect(notification.success).toHaveBeenCalledWith('Category updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicine-categories']);
    });

    it('should handle load category error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadCategory();

      expect(notification.error).toHaveBeenCalledWith('Failed to load category.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medicine-categories']);
    });
  });

  it('should navigate back on cancel', () => {
    setup('new');
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/medicine-categories']);
  });
});
