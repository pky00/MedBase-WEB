import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ThirdPartyFormComponent } from './third-party-form';

describe('ThirdPartyFormComponent', () => {
  let component: ThirdPartyFormComponent;
  let fixture: ComponentFixture<ThirdPartyFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockThirdParty = {
    id: 5, name: 'TP B', phone: '123', email: 'b@c.com',
    is_active: true, is_deleted: false,
    created_by: null, created_at: '', updated_by: null, updated_at: '',
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockThirdParty)),
      put: vi.fn().mockReturnValue(of(mockThirdParty)),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ThirdPartyFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '5' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ThirdPartyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.thirdPartyId).toBe(5);
  });

  it('should load third party on init', () => {
    expect(api.get).toHaveBeenCalledWith('third-parties/5');
    expect(component.name).toBe('TP B');
    expect(component.phone).toBe('123');
    expect(component.email).toBe('b@c.com');
  });

  it('should require name', () => {
    component.name = '';
    component.onSubmit();
    expect(component.errorMessage()).toBe('Name is required.');
  });

  it('should update third party successfully', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onSubmit();

    expect(api.put).toHaveBeenCalledWith('third-parties/5', expect.objectContaining({
      name: 'TP B',
      phone: '123',
      email: 'b@c.com',
    }));
    expect(notification.success).toHaveBeenCalledWith('Third party updated successfully.');
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties', 5]);
  });

  it('should show error on update failure', () => {
    const error = new HttpErrorResponse({ error: { detail: 'Update failed' }, status: 400 });
    api.put.mockReturnValue(throwError(() => error));

    component.onSubmit();

    expect(component.errorMessage()).toBe('Update failed');
    expect(component.saving()).toBe(false);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadThirdParty();

    expect(notification.error).toHaveBeenCalledWith('Failed to load third party.');
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties']);
  });

  it('should update isActive on active change', () => {
    component.onActiveChange({ target: { value: 'false' } } as unknown as Event);
    expect(component.isActive).toBe(false);
  });

  it('should navigate back on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties', 5]);
  });
});
