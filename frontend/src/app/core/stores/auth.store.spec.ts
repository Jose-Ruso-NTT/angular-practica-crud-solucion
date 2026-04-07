import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthApiService } from '@features/auth/auth-api.service';
import { AuthStore } from '@core/stores/auth.store';
import { UserProfile } from '@shared/models/auth.models';

describe('AuthStore', () => {
  const user: UserProfile = {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  };

  let authApi: {
    login: ReturnType<typeof vi.fn>;
    me: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };
  let store: AuthStore;

  beforeEach(() => {
    authApi = {
      login: vi.fn(),
      me: vi.fn(),
      logout: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthApiService, useValue: authApi },
        { provide: Router, useValue: router },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  it('stores the authenticated user after a successful login', () => {
    authApi.login.mockReturnValue(of({ user }));

    let result: UserProfile | undefined;
    store.login(user.email, 'admin123').subscribe((responseUser) => {
      result = responseUser;
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: user.email,
      password: 'admin123',
    });
    expect(result).toEqual(user);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isAdmin()).toBe(true);
  });

  it('restores the session from /auth/me and marks the session as ready', () => {
    authApi.me.mockReturnValue(of(user));

    let restored: boolean | undefined;
    store.restoreSession().subscribe((value) => {
      restored = value;
    });

    expect(restored).toBe(true);
    expect(store.user()).toEqual(user);
    expect(store.sessionReady()).toBe(true);
  });

  it('keeps the session anonymous after a 401 during restore', () => {
    store.setUser(user);
    authApi.me.mockReturnValue(throwError(() => new Error('Unauthorized')));

    let restored: boolean | undefined;
    store.restoreSession().subscribe((value) => {
      restored = value;
    });

    expect(restored).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.sessionReady()).toBe(true);
  });

  it('clears local state and navigates to login even when logout fails', () => {
    store.setUser(user);
    authApi.logout.mockReturnValue(throwError(() => new Error('Network error')));

    store.logout();

    expect(authApi.logout).toHaveBeenCalled();
    expect(store.user()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
