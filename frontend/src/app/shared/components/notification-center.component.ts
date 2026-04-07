import { Component, inject } from '@angular/core';
import { FeedbackStore } from '@core/stores/feedback.store';
import { ButtonDirective } from '@shared/directives/button-directive';

const NOTIFICATION_TONE_CLASSES: Record<'success' | 'error' | 'info', string> = {
  success:
    'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100',
  error:
    'border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-900 dark:bg-rose-950/90 dark:text-rose-100',
  info: 'border-slate-200 bg-white/95 text-slate-900 dark:border-slate-700 dark:bg-slate-900/92 dark:text-slate-100',
};

@Component({
  selector: 'app-notification-center',
  imports: [ButtonDirective],
  template: `
    <div
      class="pointer-events-none fixed top-4 right-4 left-4 z-50 flex flex-col gap-3 sm:left-auto sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (message of feedbackStore.messages(); track message.id) {
        <div
          class="pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur"
          [class]="toneClasses[message.kind]"
          [attr.role]="message.kind === 'error' ? 'alert' : 'status'"
        >
          <div class="flex items-start gap-3">
            <p class="min-w-0 flex-1 pt-1 text-sm leading-5 font-medium">{{ message.text }}</p>
            <button
              type="button"
              appButton="ghost"
              appButtonSize="icon-sm"
              class="self-start text-lg leading-none text-slate-500 hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              (click)="feedbackStore.remove(message.id)"
              aria-label="Cerrar mensaje"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificationCenterComponent {
  protected readonly feedbackStore = inject(FeedbackStore);
  protected readonly toneClasses = NOTIFICATION_TONE_CLASSES;
}
