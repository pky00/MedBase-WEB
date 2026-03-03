import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CurrentUser } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockCurrentUser: ReturnType<typeof signal<CurrentUser | null>>;
  let authService: { currentUser: ReturnType<typeof signal<CurrentUser | null>>; logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockCurrentUser = signal<CurrentUser | null>(null);
    authService = {
      currentUser: mockCurrentUser,
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleSidebar', () => {
    const spy = vi.fn();
    component.toggleSidebar.subscribe(spy);

    component.onToggleSidebar();
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle menu open state', () => {
    expect(component.menuOpen()).toBe(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('should call authService.logout and close menu on logout', () => {
    component.menuOpen.set(true);
    component.logout();
    expect(component.menuOpen()).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should return ? for userInitials when no user', () => {
    mockCurrentUser.set(null);
    expect(component.userInitials).toBe('?');
  });

  it('should return initials from user name', () => {
    mockCurrentUser.set({
      id: 1, username: 'jdoe', email: 'j@d.com',
      role: 'admin', is_active: true, is_deleted: false, third_party_id: 1,
      third_party: { id: 1, name: 'John Doe', type: 'user', phone: null, email: null, is_active: true, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '' },
      created_by: null, created_at: '', updated_by: null, updated_at: '',
    });
    expect(component.userInitials).toBe('JD');
  });

  it('should use username when name is empty', () => {
    mockCurrentUser.set({
      id: 1, username: 'admin', email: 'a@b.com',
      role: 'admin', is_active: true, is_deleted: false, third_party_id: 1,
      third_party: null,
      created_by: null, created_at: '', updated_by: null, updated_at: '',
    });
    expect(component.userInitials).toBe('A');
  });
});
