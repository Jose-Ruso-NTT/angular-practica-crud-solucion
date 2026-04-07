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
import { authInterceptor } from '@core/http/auth-interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('adds withCredentials to API requests', () => {
    httpClient.get('/api/cars').subscribe();

    const request = httpTestingController.expectOne('/api/cars');
    expect(request.request.withCredentials).toBe(true);
    request.flush([]);
  });

  it('does not modify non API requests', () => {
    httpClient.get('/assets/logo.svg').subscribe();

    const request = httpTestingController.expectOne('/assets/logo.svg');
    expect(request.request.withCredentials).toBe(false);
    request.flush('ok');
  });
});
