import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestOnlyGuard } from '@core/guards/guest-only-guard';
import { AuthStore } from '@core/stores/auth.store';

describe('guestOnlyGuard', () => {
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
      createUrlTree: vi.fn().mockReturnValue({ redirectedTo: '/cars' } as unknown as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows navigation for anonymous users', () => {
    authStore.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      guestOnlyGuard({} as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('redirects authenticated users away from the login page', () => {
    authStore.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      guestOnlyGuard({} as never, {} as never),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/cars']);
    expect(result).toEqual({ redirectedTo: '/cars' });
  });
});
