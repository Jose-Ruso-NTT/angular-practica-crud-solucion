import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button-directive';

type InlineMessageTone = 'error' | 'warning' | 'info';

const INLINE_MESSAGE_STYLES: Record<
  InlineMessageTone,
  { container: string; actionButton: string; ariaLive: 'assertive' | 'polite' }
> = {
  error: {
    container:
      'rounded-[1.75rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
    actionButton: 'tracking-[0.16em] uppercase border-rose-300 dark:border-rose-800',
    ariaLive: 'assertive',
  },
  warning: {
    container:
      'rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    actionButton: 'tracking-[0.16em] uppercase border-amber-300 dark:border-amber-800',
    ariaLive: 'polite',
  },
  info: {
    container:
      'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200',
    actionButton: 'tracking-[0.16em] uppercase border-slate-300 dark:border-slate-600',
    ariaLive: 'polite',
  },
};

@Component({
  selector: 'app-inline-message',
  imports: [ButtonDirective],
  host: {
    class: 'block',
  },
  template: `
    <div [class]="containerClass()" [attr.aria-live]="ariaLive()">
      <div class="flex items-center justify-between gap-3">
        <p class="min-w-0 flex-1">{{ message() }}</p>

        @if (actionLabel()) {
          <button
            type="button"
            appButton="secondary"
            appButtonSize="xs"
            [class]="actionButtonClass()"
            (click)="action.emit()"
          >
            {{ actionLabel() }}
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineMessageComponent {
  readonly tone = input<InlineMessageTone>('info');
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);

  readonly containerClass = computed(() => INLINE_MESSAGE_STYLES[this.tone()].container);
  readonly actionButtonClass = computed(() => INLINE_MESSAGE_STYLES[this.tone()].actionButton);
  readonly ariaLive = computed(() => INLINE_MESSAGE_STYLES[this.tone()].ariaLive);

  readonly action = output<void>();
}
