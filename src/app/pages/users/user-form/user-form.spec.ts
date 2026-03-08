import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { UserFormComponent } from './user-form';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockThirdPartyResponse = {
    items: [{ id: 1, name: 'TP A' }],
    total: 1, page: 1, size: 50, pages: 1,
  };

  function setup(paramId: string | null = null) {
    api = { get: vi.fn(), getList: vi.fn().mockReturnValue(of(mockThirdPartyResponse)), post: vi.fn(), put: vi.fn() };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [UserFormComponent],
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
    fixture = TestBed.createComponent(UserFormComponent);
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

    it('should require all fields', () => {
      component.onSubmit();
      expect(component.errorMessage()).toBe('Please fill in all required fields.');
    });

    it('should load third parties on init in create mode with exclude_users flag', () => {
      expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ page: 1, size: 50, exclude_users: true }));
      expect(component.thirdPartyOptions().length).toBe(1);
    });

    it('should require password for new user', () => {
      component.username = 'test';
      component.name = 'Test';
      component.onSubmit();
      expect(component.errorMessage()).toBe('Password is required for new users.');
    });

    it('should create user successfully', () => {
      const mockUser = { id: 1 };
      api.post.mockReturnValue(of(mockUser));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.username = 'test';
      component.name = 'Test';
      component.password = 'pass123';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('users', expect.objectContaining({
        username: 'test',
        password: 'pass123',
      }));
      expect(notification.success).toHaveBeenCalledWith('User created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/users', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Username taken' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.username = 'test';
      component.name = 'Test';
      component.password = 'pass';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Username taken');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockUser = {
      id: 5, username: 'jdoe', email: 'j@d.com',
      role: 'user' as const, is_active: true, is_deleted: false, third_party_id: 5,
      third_party: { id: 5, name: 'John Doe', phone: null, email: null, is_active: true, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '' },
      created_by: null, created_at: '', updated_by: null, updated_at: '',
    };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockUser));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.userId).toBe(5);
    });

    it('should load user data', () => {
      expect(component.username).toBe('jdoe');
      expect(component.name).toBe('John Doe');
    });

    it('should update user successfully', () => {
      api.put.mockReturnValue(of(mockUser));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('users/5', expect.objectContaining({ username: 'jdoe' }));
      expect(notification.success).toHaveBeenCalledWith('User updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/users', 5]);
    });

    it('should handle load user error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadUser();

      expect(notification.error).toHaveBeenCalledWith('Failed to load user.');
      expect(navigateSpy).toHaveBeenCalledWith(['/users']);
    });
  });

  it('should update role on role change', () => {
    setup('new');
    fixture.detectChanges();
    component.onRoleChange({ target: { value: 'admin' } } as unknown as Event);
    expect(component.role).toBe('admin');
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
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });
});
