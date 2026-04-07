import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '@core/config/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL) || req.withCredentials) {
    return next(req);
  }

  return next(
    req.clone({
      withCredentials: true,
    }),
  );
};
