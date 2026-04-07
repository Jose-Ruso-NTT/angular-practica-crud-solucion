import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AuthApiService } from '@features/auth/auth-api.service';
import { UserProfile } from '@shared/models/auth.models';
import { TOKEN_STORAGE_KEY } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  readonly user = signal<UserProfile | null>(null);

  readonly isAuthenticated = computed(() => !!this.token() && !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  login(email: string, password: string): Observable<UserProfile> {
    return this.authApi.login({ email, password }).pipe(
      tap((response) => {
        this.setSession(response.access_token, response.user);
      }),
      map((response) => response.user),
    );
  }

  restoreSession(): Observable<boolean> {
    if (!this.token()) {
      return of(false);
    }

    return this.authApi.me().pipe(
      tap((user) => this.user.set(user)),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private setSession(token: string, user: UserProfile): void {
    this.token.set(token);
    this.user.set(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}
