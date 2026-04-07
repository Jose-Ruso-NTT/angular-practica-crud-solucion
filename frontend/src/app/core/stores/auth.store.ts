import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { AuthApiService } from '@features/auth/auth-api.service';
import { UserProfile } from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly user = signal<UserProfile | null>(null);
  readonly sessionReady = signal(false);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  login(email: string, password: string): Observable<UserProfile> {
    return this.authApi.login({ email, password }).pipe(
      tap((response) => {
        this.setUser(response.user);
      }),
      map((response) => response.user),
    );
  }

  restoreSession(): Observable<boolean> {
    return this.authApi.me().pipe(
      tap((user) => this.setUser(user)),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
      finalize(() => this.sessionReady.set(true)),
    );
  }

  logout(): void {
    this.authApi
      .logout()
      .pipe(
        catchError(() => of(void 0)),
        finalize(() => {
          this.clearSession();
          void this.router.navigate(['/login']);
        }),
      )
      .subscribe();
  }

  clearSession(): void {
    this.user.set(null);
  }

  setUser(user: UserProfile): void {
    this.user.set(user);
  }
}
