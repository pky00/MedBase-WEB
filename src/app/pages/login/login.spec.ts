import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { getToken: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = {
      getToken: vi.fn().mockReturnValue(null),
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard if already logged in', async () => {
    const tokenAuthService = {
      getToken: vi.fn().mockReturnValue('existing-token'),
      login: vi.fn(),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: tokenAuthService },
      ],
    }).compileComponents();

    const newRouter = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(newRouter, 'navigate');

    TestBed.createComponent(LoginComponent);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error when fields are empty', () => {
    component.username = '';
    component.password = '';
    component.onSubmit();
    expect(component.errorMessage()).toBe('Please enter both username and password.');
  });

  it('should call login on valid submit', () => {
    authService.login.mockReturnValue(of({ access_token: 'token', token_type: 'bearer' }));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.username = 'admin';
    component.password = 'pass';
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('admin', 'pass');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show invalid credentials on 401', () => {
    const error = new HttpErrorResponse({ status: 401 });
    authService.login.mockReturnValue(throwError(() => error));

    component.username = 'admin';
    component.password = 'wrong';
    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid username or password.');
    expect(component.loading()).toBe(false);
  });

  it('should show generic error on other errors', () => {
    const error = new HttpErrorResponse({ status: 500 });
    authService.login.mockReturnValue(throwError(() => error));

    component.username = 'admin';
    component.password = 'pass';
    component.onSubmit();

    expect(component.errorMessage()).toBe('An error occurred. Please try again.');
  });
});
