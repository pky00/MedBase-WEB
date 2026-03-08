import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { TOKEN_KEY } from '../constants/app.constants';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize isLoggedIn from localStorage', () => {
    expect(service.isLoggedIn()).toBe(false);

    localStorage.setItem(TOKEN_KEY, 'some-token');
    const freshService = new (service.constructor as typeof AuthService)(
      TestBed.inject(AuthService)['api'],
      router
    );
    expect(freshService.isLoggedIn()).toBe(true);
  });

  describe('login', () => {
    it('should post credentials and store token', () => {
      service.login('admin', 'password').subscribe((res) => {
        expect(res.access_token).toBe('test-token');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ access_token: 'test-token', token_type: 'bearer' });

      expect(localStorage.getItem(TOKEN_KEY)).toBe('test-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      localStorage.setItem(TOKEN_KEY, 'token');
      const navigateSpy = vi.spyOn(router, 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${baseUrl}/auth/logout`);
      req.flush({});

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should clear session even on logout error', () => {
      localStorage.setItem(TOKEN_KEY, 'token');
      const navigateSpy = vi.spyOn(router, 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${baseUrl}/auth/logout`);
      req.error(new ProgressEvent('error'));

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loadCurrentUser', () => {
    it('should fetch current user and set signal', () => {
      const mockUser = {
        id: 1, username: 'admin', email: 'a@b.com',
        role: 'admin' as const, is_active: true, is_deleted: false, third_party_id: 1,
        third_party: { id: 1, name: 'Admin', phone: null, email: null, is_active: true, is_deleted: false, created_by: null, created_at: '', updated_by: null, updated_at: '' },
        created_by: null, created_at: '', updated_by: null, updated_at: '',
      };

      service.loadCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/me`);
      req.flush(mockUser);

      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      expect(service.getToken()).toBeNull();
      localStorage.setItem(TOKEN_KEY, 'abc');
      expect(service.getToken()).toBe('abc');
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      service.currentUser.set({
        id: 1, username: 'admin', email: 'a@b.com',
        role: 'admin', is_active: true, is_deleted: false, third_party_id: 1,
        third_party: null, created_by: null, created_at: '', updated_by: null, updated_at: '',
      });
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when user is not admin', () => {
      service.currentUser.set({
        id: 2, username: 'user', email: 'u@b.com',
        role: 'user', is_active: true, is_deleted: false, third_party_id: 2,
        third_party: null, created_by: null, created_at: '', updated_by: null, updated_at: '',
      });
      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when no user', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });
});
