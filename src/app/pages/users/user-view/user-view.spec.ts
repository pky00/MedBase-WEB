import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { UserViewComponent } from './user-view';

describe('UserViewComponent', () => {
  let component: UserViewComponent;
  let fixture: ComponentFixture<UserViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockUser = {
    id: 1, username: 'admin', name: 'Admin', email: 'a@b.com',
    role: 'admin', is_active: true, third_party_id: 1,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockUser)) };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserViewComponent],
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
    fixture = TestBed.createComponent(UserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    expect(api.get).toHaveBeenCalledWith('users/1');
    expect(component.user()).toEqual(mockUser);
    expect(component.loading()).toBe(false);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadUser(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load user.');
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editUser();
    expect(navigateSpy).toHaveBeenCalledWith(['/users', 1, 'edit']);
  });

  it('should navigate back to users list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });
});
