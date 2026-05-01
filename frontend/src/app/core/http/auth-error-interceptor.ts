import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { AuthStore } from '@core/stores/auth.store';
import { FeedbackStore } from '@core/stores/feedback.store';

const RETRY_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/me', '/auth/refresh', '/auth/logout'];

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const feedbackStore = inject(FeedbackStore);

  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isSkippedEndpoint = SKIP_REFRESH_PATHS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isApiRequest ||
        isSkippedEndpoint ||
        req.context.get(RETRY_AFTER_REFRESH)
      ) {
        return throwError(() => error);
      }

      return authStore
        .refreshSession()
        .pipe(
          switchMap(() => {
            return next(
              req.clone({
                context: req.context.set(RETRY_AFTER_REFRESH, true),
              }),
            );
          }),
          catchError((refreshError: unknown) => {
            authStore.clearSession();
            feedbackStore.error('La sesión ha caducado. Vuelve a iniciar sesión.');
            void router.navigate(['/login'], {
              queryParams: { returnUrl: router.url },
            });

            return throwError(() => refreshError);
          }),
        );
    }),
  );
};
