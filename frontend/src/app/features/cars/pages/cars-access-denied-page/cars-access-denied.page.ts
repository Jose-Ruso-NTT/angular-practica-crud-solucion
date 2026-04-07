import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button-directive';

@Component({
  selector: 'app-cars-access-denied-page',
  imports: [RouterLink, ButtonDirective],
  template: `
    <section
      class="mx-auto max-w-3xl rounded-4xl border border-amber-200 bg-amber-50/80 p-8 shadow-sm backdrop-blur sm:p-10"
    >
      <p class="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
        Acceso restringido
      </p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        No tienes permisos para entrar en esta pantalla.
      </h2>
      <p class="mt-4 max-w-2xl text-base leading-7 text-slate-700">
        Esta accion solo esta disponible para usuarios con rol administrador. Puedes volver al
        listado de coches o regresar al inicio para seguir navegando.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <a routerLink="/cars" queryParamsHandling="preserve" appButton="primary">
          Volver a coches
        </a>
        <a routerLink="/" queryParamsHandling="preserve" appButton="secondary"> Ir a inicio </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsAccessDeniedPage {}
