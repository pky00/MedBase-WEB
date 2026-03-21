import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth';
import { NotificationService } from './notification';
import { SessionTimeoutService } from './session-timeout';

describe('SessionTimeoutService', () => {
  let service: SessionTimeoutService;
  let authService: { logout: ReturnType<typeof vi.fn> };
  let notification: { warning: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    authService = { logout: vi.fn() };
    notification = { warning: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notification },
      ],
    });
    service = TestBed.inject(SessionTimeoutService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call logout after 30 minutes of inactivity', () => {
    service.start();
    vi.advanceTimersByTime(30 * 60 * 1000);
    expect(authService.logout).toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalledWith('Session expired due to inactivity.');
  });

  it('should not call logout before 30 minutes', () => {
    service.start();
    vi.advanceTimersByTime(29 * 60 * 1000);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('should reset timer on user activity', () => {
    service.start();
    vi.advanceTimersByTime(20 * 60 * 1000);
    document.dispatchEvent(new Event('mousedown'));
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(authService.logout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should stop timer and remove listeners on stop()', () => {
    service.start();
    service.stop();
    vi.advanceTimersByTime(30 * 60 * 1000);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('should stop timer on ngOnDestroy', () => {
    service.start();
    service.ngOnDestroy();
    vi.advanceTimersByTime(30 * 60 * 1000);
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
