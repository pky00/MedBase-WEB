import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { SessionTimeoutService } from '../../core/services/session-timeout';
import { LayoutComponent } from './layout';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let authService: { loadCurrentUser: ReturnType<typeof vi.fn>; isAdmin: ReturnType<typeof vi.fn>; currentUser: ReturnType<typeof vi.fn> };
  let sessionTimeout: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      loadCurrentUser: vi.fn().mockReturnValue(of({
        id: 1, username: 'admin', name: 'Admin', email: 'a@b.com',
        role: 'admin', is_active: true, third_party_id: 1,
      })),
      isAdmin: vi.fn().mockReturnValue(true),
      currentUser: vi.fn().mockReturnValue(null),
    };
    sessionTimeout = {
      start: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: SessionTimeoutService, useValue: sessionTimeout },
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user on init', () => {
    expect(authService.loadCurrentUser).toHaveBeenCalled();
  });

  it('should start session timeout on init', () => {
    expect(sessionTimeout.start).toHaveBeenCalled();
  });

  it('should stop session timeout on destroy', () => {
    component.ngOnDestroy();
    expect(sessionTimeout.stop).toHaveBeenCalled();
  });

  it('should toggle sidebar', () => {
    expect(component.sidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(true);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('should close sidebar', () => {
    component.sidebarOpen.set(true);
    component.closeSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });
});
