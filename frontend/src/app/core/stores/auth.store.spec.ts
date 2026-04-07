import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
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
    refresh: ReturnType<typeof vi.fn>;
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
      refresh: vi.fn(),
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

  it('refreshes the session when /auth/me returns 401 during restore', () => {
    store.setUser(user);
    authApi.me.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );
    authApi.refresh.mockReturnValue(of({ user }));

    let restored: boolean | undefined;
    store.restoreSession().subscribe((value) => {
      restored = value;
    });

    expect(authApi.refresh).toHaveBeenCalledTimes(1);
    expect(restored).toBe(true);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.sessionReady()).toBe(true);
  });

  it('keeps the session anonymous when refresh also fails during restore', () => {
    store.setUser(user);
    authApi.me.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );
    authApi.refresh.mockReturnValue(throwError(() => new Error('Refresh failed')));

    let restored: boolean | undefined;
    store.restoreSession().subscribe((value) => {
      restored = value;
    });

    expect(authApi.refresh).toHaveBeenCalledTimes(1);
    expect(restored).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.sessionReady()).toBe(true);
  });

  it('shares a single in-flight refresh request across subscribers', () => {
    const refreshSubject = new Subject<{ user: UserProfile }>();
    authApi.refresh.mockReturnValue(refreshSubject.asObservable());

    let firstResult: UserProfile | undefined;
    let secondResult: UserProfile | undefined;

    store.refreshSession().subscribe((responseUser) => {
      firstResult = responseUser;
    });
    store.refreshSession().subscribe((responseUser) => {
      secondResult = responseUser;
    });

    expect(authApi.refresh).toHaveBeenCalledTimes(1);

    refreshSubject.next({ user });
    refreshSubject.complete();

    expect(firstResult).toEqual(user);
    expect(secondResult).toEqual(user);
    expect(store.user()).toEqual(user);
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
