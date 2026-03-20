import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { TOKEN_KEY } from '../constants/app.constants';
import { NotificationService } from '../services/notification';
import { AuthService } from '../services/auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let notification: NotificationService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    notification = TestBed.inject(NotificationService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem(TOKEN_KEY, 'my-token');

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('should not add Authorization header when no token', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should clear session and redirect on 401 error for auth endpoints', () => {
    localStorage.setItem(TOKEN_KEY, 'my-token');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const errorSpy = vi.fn();
    const completeSpy = vi.fn();

    httpClient.post('/api/v1/auth/login', {}).subscribe({ error: errorSpy, complete: completeSpy });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(authService.isLoggedIn()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should show permission denied notification on 403', () => {
    const errorSpy = vi.spyOn(notification, 'error');
    const completeSpy = vi.fn();

    httpClient.get('/test').subscribe({ error: () => {}, complete: completeSpy });

    const req = httpMock.expectOne('/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(errorSpy).toHaveBeenCalledWith('Permission denied. You do not have access to this resource.');
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should sanitize 500 error messages', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let receivedError: any;

    httpClient.get('/test').subscribe({
      error: (err) => { receivedError = err; },
    });

    const req = httpMock.expectOne('/test');
    req.flush({ detail: 'Internal database error with sensitive info' }, { status: 500, statusText: 'Internal Server Error' });

    expect(consoleSpy).toHaveBeenCalled();
    expect(receivedError.error.detail).toBe('An unexpected server error occurred. Please try again later.');
    consoleSpy.mockRestore();
  });

  it('should not clear session on non-401/403 errors', () => {
    localStorage.setItem(TOKEN_KEY, 'my-token');

    httpClient.get('/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(localStorage.getItem(TOKEN_KEY)).toBe('my-token');
  });
});
