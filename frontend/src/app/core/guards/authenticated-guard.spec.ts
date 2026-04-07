import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authenticatedGuard } from '@core/guards/authenticated-guard';
import { AuthStore } from '@core/stores/auth.store';

describe('authenticatedGuard', () => {
  let authStore: {
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authStore = {
      isAuthenticated: vi.fn(),
    };
    router = {
      createUrlTree: vi.fn().mockReturnValue({ redirectedTo: '/login' } as unknown as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows navigation for authenticated users', () => {
    authStore.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authenticatedGuard({} as never, { url: '/cars/123' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects anonymous users to login with the current returnUrl', () => {
    authStore.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authenticatedGuard({} as never, { url: '/cars/123' } as never),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/cars/123' },
    });
    expect(result).toEqual({ redirectedTo: '/login' });
  });
});
