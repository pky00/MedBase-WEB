import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { CategoryFormComponent } from './category-form';

describe('MedicalDeviceCategoryFormComponent', () => {
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
      api.post.mockReturnValue(of({ id: 1, name: 'Monitors' }));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'Monitors';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('medical-device-categories', expect.objectContaining({ name: 'Monitors' }));
      expect(notification.success).toHaveBeenCalledWith('Category created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories']);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'Monitors';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockCategory = { id: 2, name: 'Imaging', description: 'Imaging devices' };

    beforeEach(() => {
      setup('2');
      api.get.mockReturnValue(of(mockCategory));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.categoryId).toBe(2);
    });

    it('should load category data', () => {
      expect(component.name).toBe('Imaging');
      expect(component.description).toBe('Imaging devices');
    });

    it('should update category successfully', () => {
      api.put.mockReturnValue(of(mockCategory));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('medical-device-categories/2', expect.objectContaining({ name: 'Imaging' }));
      expect(notification.success).toHaveBeenCalledWith('Category updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories']);
    });

    it('should handle load category error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadCategory();

      expect(notification.error).toHaveBeenCalledWith('Failed to load category.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories']);
    });
  });

  it('should navigate back on cancel', () => {
    setup('new');
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-device-categories']);
  });
});
