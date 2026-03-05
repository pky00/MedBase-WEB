import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { EquipmentFormComponent } from './equipment-form';

describe('EquipmentFormComponent', () => {
  let component: EquipmentFormComponent;
  let fixture: ComponentFixture<EquipmentFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockCategoryResponse = {
    items: [{ id: 1, name: 'Imaging' }],
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
      imports: [EquipmentFormComponent],
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
    fixture = TestBed.createComponent(EquipmentFormComponent);
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

    it('should require name and category', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Name and category are required.');
    });

    it('should create equipment successfully', () => {
      const mockEquipment = { id: 1, name: 'X-Ray Machine' };
      api.post.mockReturnValue(of(mockEquipment));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.name = 'X-Ray Machine';
      component.categoryId = 1;
      component.condition = 'new';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('equipment', expect.objectContaining({
        name: 'X-Ray Machine',
        category_id: 1,
        condition: 'new',
      }));
      expect(notification.success).toHaveBeenCalledWith('Equipment created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.name = 'X-Ray Machine';
      component.categoryId = 1;
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockEquipment = {
      id: 3, name: 'Defibrillator', description: 'Heart defibrillator',
      category_id: 1, category_name: 'Emergency', condition: 'good' as const,
      is_active: true, quantity: 5, is_deleted: false, created_at: '', updated_at: '',
    };

    beforeEach(() => {
      setup('3');
      api.get.mockReturnValue(of(mockEquipment));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.equipmentId).toBe(3);
    });

    it('should load equipment data', () => {
      expect(component.name).toBe('Defibrillator');
      expect(component.condition).toBe('good');
      expect(component.categoryId).toBe(1);
    });

    it('should update equipment successfully', () => {
      api.put.mockReturnValue(of(mockEquipment));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('equipment/3', expect.objectContaining({ name: 'Defibrillator' }));
      expect(notification.success).toHaveBeenCalledWith('Equipment updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/equipment', 3]);
    });

    it('should handle load equipment error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadEquipment();

      expect(notification.error).toHaveBeenCalledWith('Failed to load equipment.');
      expect(navigateSpy).toHaveBeenCalledWith(['/equipment']);
    });
  });

  it('should update condition on condition change', () => {
    setup('new');
    fixture.detectChanges();
    component.onConditionChange({ target: { value: 'fair' } } as unknown as Event);
    expect(component.condition).toBe('fair');
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
    expect(navigateSpy).toHaveBeenCalledWith(['/equipment']);
  });
});
