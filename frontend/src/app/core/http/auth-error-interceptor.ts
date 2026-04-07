import {
  HttpBackend,
  HttpClient,
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
import { LoginResponse } from '@shared/models/auth.models';

const RETRY_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

const AUTH_SESSION_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const feedbackStore = inject(FeedbackStore);
  const httpBackend = inject(HttpBackend);
  const rawHttp = new HttpClient(httpBackend);

  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isSessionEndpoint = AUTH_SESSION_PATHS.some((path) => req.url.includes(path));
  const isMeEndpoint = req.url.includes('/auth/me');

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isApiRequest ||
        isSessionEndpoint ||
        isMeEndpoint ||
        req.context.get(RETRY_AFTER_REFRESH)
      ) {
        return throwError(() => error);
      }

      return rawHttp
        .post<LoginResponse>(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          switchMap((response) => {
            authStore.setUser(response.user);

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
