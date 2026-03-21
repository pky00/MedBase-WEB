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

  afterEach(() => {
    component.ngOnDestroy();
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

  it('should disable login after 5 failed attempts', () => {
    vi.useFakeTimers();
    const error = new HttpErrorResponse({ status: 401 });
    authService.login.mockReturnValue(throwError(() => error));

    for (let i = 0; i < 5; i++) {
      component.username = 'admin';
      component.password = 'wrong';
      component.onSubmit();
    }

    expect(component.loginDisabled()).toBe(true);
    expect(component.cooldownRemaining()).toBe(30);
    expect(component.errorMessage()).toContain('Too many failed attempts');

    // Should not submit while disabled
    authService.login.mockClear();
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should re-enable login after cooldown', () => {
    vi.useFakeTimers();
    const error = new HttpErrorResponse({ status: 401 });
    authService.login.mockReturnValue(throwError(() => error));

    for (let i = 0; i < 5; i++) {
      component.username = 'admin';
      component.password = 'wrong';
      component.onSubmit();
    }

    expect(component.loginDisabled()).toBe(true);
    vi.advanceTimersByTime(30000);
    expect(component.loginDisabled()).toBe(false);
    expect(component.cooldownRemaining()).toBe(0);

    vi.useRealTimers();
  });

  it('should reset failed attempts on successful login', () => {
    const error = new HttpErrorResponse({ status: 401 });
    authService.login.mockReturnValue(throwError(() => error));

    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      component.username = 'admin';
      component.password = 'wrong';
      component.onSubmit();
    }

    // Succeed
    authService.login.mockReturnValue(of({ access_token: 'token', token_type: 'bearer' }));
    component.username = 'admin';
    component.password = 'correct';
    component.onSubmit();

    // After success, counter should be reset (internally)
    // Re-fail should count from 0 again
    authService.login.mockReturnValue(throwError(() => error));
    for (let i = 0; i < 4; i++) {
      component.username = 'admin';
      component.password = 'wrong';
      component.onSubmit();
    }
    expect(component.loginDisabled()).toBe(false); // Only 4, not 5
  });
});
