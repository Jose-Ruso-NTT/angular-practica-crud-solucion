import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { ButtonDirective } from '@shared/directives/button-directive';
import { IfAdminDirective } from '@shared/directives/if-admin-directive';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ButtonDirective, IfAdminDirective],
  template: `
    <section class="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <article
        class="rounded-4xl border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/65"
      >
        <p
          class="text-xs font-semibold tracking-[0.24em] text-teal-700 uppercase dark:text-teal-300"
        >
          Proyecto de formación
        </p>
        <h2
          class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          Una base Angular 21 limpia, didáctica y preparada para explicar decisiones reales.
        </h2>
        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          La aplicación trabaja contra el backend del repositorio, usa autenticación JWT,
          formularios reactivos, estados claros y una estructura pensada para enseñar sin
          sobreingenieria.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/cars" queryParamsHandling="preserve" appButton="primary">
            Ir al catalogo
          </a>
          <a
            *appIfAdmin
            routerLink="/cars/new"
            queryParamsHandling="preserve"
            appButton="secondary"
          >
            Crear coche
          </a>
        </div>
      </article>

      <aside
        class="rounded-4xl border border-slate-200 bg-slate-950 p-8 text-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="text-xs font-semibold tracking-[0.24em] text-teal-300 uppercase">Sesión actual</p>
        <h3 class="mt-3 text-2xl font-semibold">{{ authStore.user()?.name }}</h3>
        <p class="mt-2 text-sm text-slate-300">{{ authStore.user()?.email }}</p>
        <div
          class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-white/8 dark:bg-white/3"
        >
          <p class="text-xs tracking-[0.22em] text-slate-400 uppercase">Rol</p>
          <p class="mt-2 text-lg font-semibold">{{ authStore.user()?.role }}</p>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            ADMIN puede crear, editar, borrar y gestionar documentos. USER mantiene un modo de
            consulta.
          </p>
        </div>
      </aside>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly authStore = inject(AuthStore);
}
