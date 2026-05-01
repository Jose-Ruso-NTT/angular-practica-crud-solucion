import { DestroyRef, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, pairwise, startWith } from 'rxjs/operators';

export function provideScrollRestoration() {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const router = inject(Router);
      const destroyRef = inject(DestroyRef);

      router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          startWith(null),
          pairwise(),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe(([prev, curr]) => {
          if (!prev || !curr) return;
          const prevPath = prev.urlAfterRedirects.split('?')[0];
          const currPath = curr.urlAfterRedirects.split('?')[0];
          if (prevPath !== currPath) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    }),
  ]);
}
