import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API, ROUTES, TOKEN_KEY } from '../constants/app.constants';
import { CurrentUser, LoginResponse } from '../models/auth.model';
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

  loadCurrentUser(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>(API.AUTH_ME).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate([ROUTES.LOGIN]);
  }
}
