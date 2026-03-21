import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../services/auth';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: { getToken: ReturnType<typeof vi.fn>; isTokenExpired: ReturnType<typeof vi.fn>; clearSession: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authService = {
      getToken: vi.fn(),
      isTokenExpired: vi.fn(),
      clearSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should allow access when token exists and is not expired', () => {
    authService.getToken.mockReturnValue('valid-token');
    authService.isTokenExpired.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to login when no token', () => {
    authService.getToken.mockReturnValue(null);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login and clear session when token is expired', () => {
    authService.getToken.mockReturnValue('expired-token');
    authService.isTokenExpired.mockReturnValue(true);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(authService.clearSession).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
