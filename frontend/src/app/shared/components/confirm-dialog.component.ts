import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button-directive';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonDirective],
  template: `
    <div
      class="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    >
      <p class="text-xs font-semibold tracking-[0.24em] text-rose-600 uppercase">Confirmación</p>
      <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {{ data.title }}
      </h2>
      <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {{ data.description }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          appButton="secondary"
          appButtonSize="sm"
          (click)="dialogRef.close(false)"
        >
          {{ data.cancelLabel ?? 'Cancelar' }}
        </button>
        <button type="button" appButton="danger" appButtonSize="sm" (click)="dialogRef.close(true)">
          {{ data.confirmLabel }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly dialogRef = inject(DialogRef<boolean, ConfirmDialogComponent>);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
}
