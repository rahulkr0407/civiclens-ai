import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isAuthRequest(url: string): boolean {
  return /\/auth\/(login|signup|refresh|logout)/.test(url);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Attach the access token to non-auth requests.
  if (!isAuthRequest(req.url)) {
    const token = auth.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExpiredToken =
        error.status === 401 &&
        !isAuthRequest(req.url) &&
        !!auth.getRefreshToken();

      if (isExpiredToken) {
        return auth.refresh().pipe(
          switchMap(() => {
            const retried = req.clone({
              setHeaders: {
                Authorization: `Bearer ${auth.getToken() ?? ''}`,
              },
            });
            return next(retried);
          }),
          catchError(() => {
            auth.clearSession();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};