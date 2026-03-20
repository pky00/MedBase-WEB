import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, throwError } from 'rxjs';

import { API, ROUTES, TOKEN_KEY } from '../constants/app.constants';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Skip refresh for login and refresh endpoints
        const isAuthEndpoint = req.url.includes(API.AUTH_LOGIN) || req.url.includes(API.AUTH_REFRESH);

        if (!isAuthEndpoint && token) {
          return authService.refreshToken().pipe(
            switchMap((response) => {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              });
              return next(newReq);
            }),
            catchError(() => {
              authService.clearSession();
              router.navigate([ROUTES.LOGIN]);
              return EMPTY;
            })
          );
        }

        localStorage.removeItem(TOKEN_KEY);
        authService.isLoggedIn.set(false);
        authService.currentUser.set(null);
        router.navigate([ROUTES.LOGIN]);
        return EMPTY;
      }

      if (error.status === 403) {
        notification.error('Permission denied. You do not have access to this resource.');
        return EMPTY;
      }

      // Sanitize error messages - log details, show generic message
      if (error.status >= 500) {
        console.error('Server error:', error.status, error.message, error.error?.detail);
        return throwError(() => new HttpErrorResponse({
          error: { detail: 'An unexpected server error occurred. Please try again later.' },
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined,
        }));
      }

      return throwError(() => error);
    })
  );
};
