import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { ChangePasswordComponent } from './change-password';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authService: { updatePassword: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = { updatePassword: vi.fn() };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when fields are empty', () => {
    component.onSubmit();
    expect(component.errorMessage()).toBe('Please fill in all fields.');
  });

  it('should show error when new password is too short', () => {
    component.currentPassword = 'oldpass';
    component.newPassword = 'short';
    component.confirmPassword = 'short';
    component.onSubmit();
    expect(component.errorMessage()).toBe('New password must be at least 8 characters.');
  });

  it('should show error when passwords do not match', () => {
    component.currentPassword = 'oldpass';
    component.newPassword = 'newpassword123';
    component.confirmPassword = 'different123';
    component.onSubmit();
    expect(component.errorMessage()).toBe('New passwords do not match.');
  });

  it('should call updatePassword and navigate on success', () => {
    authService.updatePassword.mockReturnValue(of(undefined));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.currentPassword = 'oldpass';
    component.newPassword = 'newpassword123';
    component.confirmPassword = 'newpassword123';
    component.onSubmit();

    expect(authService.updatePassword).toHaveBeenCalledWith({
      current_password: 'oldpass',
      new_password: 'newpassword123',
    });
    expect(notification.success).toHaveBeenCalledWith('Password updated successfully.');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error on 401 response', () => {
    const error = new HttpErrorResponse({ status: 401, error: { detail: 'Wrong password' } });
    authService.updatePassword.mockReturnValue(throwError(() => error));

    component.currentPassword = 'wrongpass';
    component.newPassword = 'newpassword123';
    component.confirmPassword = 'newpassword123';
    component.onSubmit();

    expect(component.errorMessage()).toBe('Wrong password');
    expect(component.saving()).toBe(false);
  });

  it('should show generic error on server error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    authService.updatePassword.mockReturnValue(throwError(() => error));

    component.currentPassword = 'oldpass';
    component.newPassword = 'newpassword123';
    component.confirmPassword = 'newpassword123';
    component.onSubmit();

    expect(component.errorMessage()).toBe('Failed to update password. Please try again.');
  });

  it('should navigate to dashboard on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
