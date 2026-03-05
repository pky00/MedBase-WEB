import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DeviceViewComponent } from './device-view';

describe('DeviceViewComponent', () => {
  let component: DeviceViewComponent;
  let fixture: ComponentFixture<DeviceViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockDevice = {
    id: 1, name: 'Blood Pressure Monitor', description: 'Digital BP monitor',
    category_id: 1, category_name: 'Monitors', is_active: true,
    quantity: 10, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockDevice)) };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DeviceViewComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DeviceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load device on init', () => {
    expect(api.get).toHaveBeenCalledWith('medical-devices/1');
    expect(component.device()).toEqual(mockDevice);
    expect(component.loading()).toBe(false);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadDevice(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load medical device.');
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editDevice();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices', 1, 'edit']);
  });

  it('should navigate back to devices list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/medical-devices']);
  });
});
