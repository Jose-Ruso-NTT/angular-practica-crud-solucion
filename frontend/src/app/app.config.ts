import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from '@app/app.routes';
import { authErrorInterceptor } from '@core/http/auth-error-interceptor';
import { authInterceptor } from '@core/http/auth-interceptor';
import { AuthStore } from '@core/stores/auth.store';
import { ThemeStore } from '@core/stores/theme.store';
import { firstValueFrom } from 'rxjs';
import { provideScrollRestoration } from './core/providers/scroll-restoration.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor, authErrorInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideScrollRestoration(),
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      return firstValueFrom(authStore.restoreSession());
    }),
    provideAppInitializer(() => {
      const themeStore = inject(ThemeStore);
      themeStore.initialize();
    }),
  ],
};
