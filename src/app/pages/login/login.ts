import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ROUTES } from '../../core/constants/app.constants';
import { AuthService } from '../../core/services/auth';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';

const MAX_LOGIN_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

@Component({
  selector: 'app-login',
  imports: [FormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnDestroy {
  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');
  loginDisabled = signal(false);
  cooldownRemaining = signal(0);

  private failedAttempts = 0;
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (authService.getToken()) {
      this.router.navigate([ROUTES.DASHBOARD]);
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  onSubmit(): void {
    if (this.loginDisabled()) return;

    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter both username and password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.failedAttempts = 0;
        this.router.navigate([ROUTES.DASHBOARD]);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 401) {
          this.failedAttempts++;
          if (this.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
            this.startCooldown();
            this.errorMessage.set(
              `Too many failed attempts. Please wait ${COOLDOWN_SECONDS} seconds before trying again.`
            );
          } else {
            this.errorMessage.set('Invalid username or password.');
          }
        } else {
          this.errorMessage.set('An error occurred. Please try again.');
        }
      },
    });
  }

  private startCooldown(): void {
    this.loginDisabled.set(true);
    this.cooldownRemaining.set(COOLDOWN_SECONDS);

    this.cooldownInterval = setInterval(() => {
      const remaining = this.cooldownRemaining() - 1;
      this.cooldownRemaining.set(remaining);
      if (remaining <= 0) {
        this.loginDisabled.set(false);
        this.failedAttempts = 0;
        this.errorMessage.set('');
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
          this.cooldownInterval = null;
        }
      }
    }, 1000);
  }
}
