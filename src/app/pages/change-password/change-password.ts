import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ROUTES } from '../../core/constants/app.constants';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule, InputComponent, ButtonComponent],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  saving = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  onSubmit(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage.set('New password must be at least 8 characters.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.authService.updatePassword({
      current_password: this.currentPassword,
      new_password: this.newPassword,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Password updated successfully.');
        this.router.navigate([ROUTES.DASHBOARD]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        if (error.status === 400 || error.status === 401) {
          this.errorMessage.set(error.error?.detail || 'Current password is incorrect.');
        } else {
          this.errorMessage.set('Failed to update password. Please try again.');
        }
      },
    });
  }

  cancel(): void {
    this.router.navigate([ROUTES.DASHBOARD]);
  }
}
