import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

export const adminOnlyMatchGuard: CanMatchFn = (): boolean => {
  const authStore = inject(AuthStore);

  return authStore.isAdmin();
};
