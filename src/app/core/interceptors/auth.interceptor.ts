import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiUrl = typeof req.url === 'string' && req.url.startsWith(environment.apiUrl);
  const isAuthEndpoint = isApiUrl && /\/auth\/token\//.test(req.url);

  let authReq: HttpRequest<unknown> = req;

  if (isApiUrl && !isAuthEndpoint) {
    const token = auth.getAccessToken();
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 for API requests
      if (error.status === 401 && isApiUrl && !isAuthEndpoint) {
        const refresh = auth.getRefreshToken();
        if (!refresh) {
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        // Try to refresh token once and retry original request
        return auth.refreshToken(refresh).pipe(
          switchMap((res) => {
            if (res?.access) {
              auth.updateAccessToken(res.access);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access}` },
              });
              return next(retryReq);
            }
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};

