import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ApiService } from './api';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should perform a GET request', () => {
      const mockData = { id: 1, name: 'Test' };
      service.get<typeof mockData>('users/1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getList', () => {
    it('should perform a GET request with query params', () => {
      const mockResponse = { items: [], total: 0, page: 1, size: 10, pages: 0 };
      service.getList('users', { page: 1, size: 10, sort: 'name', order: 'asc' as const }).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sort')).toBe('name');
      expect(req.request.params.get('order')).toBe('asc');
      req.flush(mockResponse);
    });

    it('should skip empty/null/undefined params', () => {
      const mockResponse = { items: [], total: 0, page: 1, size: 10, pages: 0 };
      service.getList('users', { page: 1, role: '', is_active: undefined }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/users`);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.has('role')).toBe(false);
      expect(req.request.params.has('is_active')).toBe(false);
      req.flush(mockResponse);
    });
  });

  describe('post', () => {
    it('should perform a POST request with JSON body', () => {
      const body = { username: 'test' };
      service.post('users', body).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('postForm', () => {
    it('should perform a POST with form-urlencoded body', () => {
      const body = new HttpParams().set('username', 'test').set('password', 'pass');
      service.postForm('auth/login', body).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect(req.request.body).toBe(body.toString());
      req.flush({});
    });
  });

  describe('put', () => {
    it('should perform a PUT request', () => {
      const body = { name: 'Updated' };
      service.put('users/1', body).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should perform a DELETE request', () => {
      service.delete('users/1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
