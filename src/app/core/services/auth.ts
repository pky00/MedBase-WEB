import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api';
import { LoginResponse, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken());
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor() {
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    this.loadingSignal.set(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.api.postForm<LoginResponse>('/auth/login', formData).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.loadCurrentUser();
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  loadCurrentUser(): void {
    this.api.get<User>('/users/me').pipe(
      tap(user => this.currentUserSignal.set(user)),
      catchError(error => {
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    ).subscribe();
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(environment.tokenKey);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
