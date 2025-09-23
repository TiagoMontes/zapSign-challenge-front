import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return !auth.isAuthenticated() ? true : (router.createUrlTree(['/']) as UrlTree);
};

export const guestMatchGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return !auth.isAuthenticated() ? true : (router.createUrlTree(['/']) as UrlTree);
};
