import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROUTES } from '../constants/app.constants';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  if (!token) {
    router.navigate([ROUTES.LOGIN]);
    return false;
  }

  if (authService.isTokenExpired(token)) {
    authService.clearSession();
    router.navigate([ROUTES.LOGIN]);
    return false;
  }

  return true;
};
