import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { ThemeStore } from '@core/stores/theme.store';
import { ButtonDirective } from '@shared/directives/button-directive';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonDirective],
  template: `
    <div
      class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_30%),linear-gradient(180deg,#020617_0%,#111827_100%)] dark:text-slate-100"
    >
      <header
        class="border-b border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/70"
      >
        <div
          class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div>
            <p
              class="text-xs font-semibold tracking-[0.24em] text-teal-700 uppercase dark:text-teal-300"
            >
              Angular 21 Reference App
            </p>
            <h1 class="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Vehicle Catalog
            </h1>
          </div>

          <nav
            class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm dark:border-slate-700/80 dark:bg-slate-900/80"
          >
            <a
              routerLink="/"
              queryParamsHandling="preserve"
              routerLinkActive="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-full px-4 py-2 font-medium text-slate-600 transition hover:bg-white/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-slate-100"
            >
              Inicio
            </a>
            <a
              routerLink="/cars"
              queryParamsHandling="preserve"
              routerLinkActive="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
              class="rounded-full px-4 py-2 font-medium text-slate-600 transition hover:bg-white/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-slate-100"
            >
              Coches
            </a>
          </nav>

          <div class="flex items-center gap-4">
            <div class="hidden text-right sm:block">
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {{ authStore.user()?.name }}
              </p>
              <p class="text-xs tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                {{ authStore.user()?.role }}
              </p>
            </div>
            <button
              type="button"
              appButton="ghost"
              appButtonSize="icon"
              class="rounded-full dark:hover:bg-white/8 dark:hover:text-slate-100"
              [attr.aria-label]="
                themeStore.isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
              "
              [attr.aria-pressed]="themeStore.isDark()"
              [title]="themeStore.isDark() ? 'Tema oscuro activo' : 'Tema claro activo'"
              (click)="themeStore.toggleTheme()"
            >
              @if (themeStore.isDark()) {
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                >
                  <path d="M12 3v2.25" />
                  <path d="M12 18.75V21" />
                  <path d="m5.64 5.64 1.59 1.59" />
                  <path d="m16.77 16.77 1.59 1.59" />
                  <path d="M3 12h2.25" />
                  <path d="M18.75 12H21" />
                  <path d="m5.64 18.36 1.59-1.59" />
                  <path d="m16.77 7.23 1.59-1.59" />
                  <circle cx="12" cy="12" r="4.25" />
                </svg>
              } @else {
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                >
                  <path d="M21 12.8A8.99 8.99 0 0 1 11.2 3a9 9 0 1 0 9.8 9.8Z" />
                </svg>
              }
            </button>
            <button
              type="button"
              appButton="secondary"
              appButtonSize="sm"
              (click)="authStore.logout()"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppShellComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly themeStore = inject(ThemeStore);
}
