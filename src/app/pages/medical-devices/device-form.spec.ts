import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DeviceFormComponent } from './device-form';

describe('DeviceFormComponent', () => {
  let component: DeviceFormComponent;
  let fixture: ComponentFixture<DeviceFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockCategoryResponse = {
    items: [{ id: 1, name: 'Monitors' }],
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
      imports: [DeviceFormComponent],
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
    fixture = TestBed.createComponent(DeviceFormComponent);
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
      expect(api.getList).toHaveBeenCalledWith('medical-device-categories', expect.objectContaining({ page: 1, size: 50 }));
      expect(component.categoryOptions().length).toBe(1);
    });

    it('should require code, name and category', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Code, name and category are required.');
    });

    it('should create device successfully', () => {
      const mockDevice = { id: 1, code: 'MD-001', name: 'Blood Pressure Monitor' };
      api.post.mockReturnValue(of(mockDevice));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.code = 'MD-001';
      component.name = 'Blood Pressure Monitor';
      component.categoryId = 1;
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('medical-devices', expect.objectContaining({
        code: 'MD-001',
        name: 'Blood Pressure Monitor',
        category_id: 1,
      }));
      expect(notification.success).toHaveBeenCalledWith('Medical device created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Name already exists' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.code = 'MD-001';
      component.name = 'Blood Pressure Monitor';
      component.categoryId = 1;
      component.onSubmit();

      expect(component.errorMessage()).toBe('Name already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockDevice = {
      id: 4, code: 'MD-004', name: 'Pulse Oximeter', description: 'Measures blood oxygen',
      category_id: 1, category_name: 'Monitors', is_active: true,
      quantity: 15, is_deleted: false, created_at: '', updated_at: '',
    };

    beforeEach(() => {
      setup('4');
      api.get.mockReturnValue(of(mockDevice));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.deviceId).toBe(4);
    });

    it('should load device data', () => {
      expect(component.name).toBe('Pulse Oximeter');
      expect(component.categoryId).toBe(1);
    });

    it('should update device successfully', () => {
      api.put.mockReturnValue(of(mockDevice));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('medical-devices/4', expect.objectContaining({ name: 'Pulse Oximeter' }));
      expect(notification.success).toHaveBeenCalledWith('Medical device updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices', 4]);
    });

    it('should handle load device error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadDevice();

      expect(notification.error).toHaveBeenCalledWith('Failed to load medical device.');
      expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
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
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
  });
});
