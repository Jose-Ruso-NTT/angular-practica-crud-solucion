import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthStore } from '@core/stores/auth.store';
import { FeedbackStore } from '@core/stores/feedback.store';
import { authErrorInterceptor } from '@core/http/auth-error-interceptor';

describe('authErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authStore: {
    refreshSession: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };
  let feedbackStore: {
    error: ReturnType<typeof vi.fn>;
  };
  let router: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authStore = {
      refreshSession: vi.fn(),
      clearSession: vi.fn(),
    };
    feedbackStore = {
      error: vi.fn(),
    };
    router = {
      url: '/cars?page=2',
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStore },
        { provide: FeedbackStore, useValue: feedbackStore },
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('refreshes the session and retries the original request after a 401', () => {
    authStore.refreshSession.mockReturnValue(
      of({
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      }),
    );

    let responseBody: unknown;
    httpClient.get('/api/cars').subscribe((response) => {
      responseBody = response;
    });

    const originalRequest = httpTestingController.expectOne('/api/cars');
    originalRequest.flush(null, { status: 401, statusText: 'Unauthorized' });

    const retriedRequest = httpTestingController.expectOne('/api/cars');
    retriedRequest.flush([{ id: 'car-1' }]);

    expect(authStore.refreshSession).toHaveBeenCalledTimes(1);
    expect(responseBody).toEqual([{ id: 'car-1' }]);
  });

  it('does not try to refresh when the failing request is /auth/refresh', () => {
    let receivedError: unknown;
    httpClient.post('/api/auth/refresh', {}).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const refreshRequest = httpTestingController.expectOne('/api/auth/refresh');
    refreshRequest.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toBeTruthy();
    expect(authStore.clearSession).not.toHaveBeenCalled();
    expect(feedbackStore.error).not.toHaveBeenCalled();
  });

  it('clears the session and redirects to login when refresh fails', () => {
    authStore.refreshSession.mockReturnValue(throwError(() => new Error('Refresh failed')));

    let receivedError: unknown;
    httpClient.get('/api/cars').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const originalRequest = httpTestingController.expectOne('/api/cars');
    originalRequest.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toBeTruthy();
    expect(authStore.clearSession).toHaveBeenCalled();
    expect(feedbackStore.error).toHaveBeenCalledWith(
      'La sesión ha caducado. Vuelve a iniciar sesión.',
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/cars?page=2' },
    });
  });
});
