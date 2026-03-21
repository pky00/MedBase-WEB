import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API, ROUTES, TOKEN_KEY } from '../constants/app.constants';
import { CurrentUser, LoginResponse, PasswordUpdate } from '../models/auth.model';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<CurrentUser | null>(null);
  isLoggedIn = signal(false);

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.isLoggedIn.set(!!this.getToken());
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.api.postForm<LoginResponse>(API.AUTH_LOGIN, body).pipe(
      tap((response) => {
        this.setToken(response.access_token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    this.api.post(API.AUTH_LOGOUT, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  refreshToken(): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API.AUTH_REFRESH, {}).pipe(
      tap((response) => {
        this.setToken(response.access_token);
        this.isLoggedIn.set(true);
      })
    );
  }

  loadCurrentUser(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>(API.AUTH_ME).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  updatePassword(data: PasswordUpdate): Observable<void> {
    return this.api.put<void>(API.AUTH_PASSWORD, data);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate([ROUTES.LOGIN]);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
