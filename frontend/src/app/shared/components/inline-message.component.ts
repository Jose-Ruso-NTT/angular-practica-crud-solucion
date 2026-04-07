import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button-directive';
import { InlineMessageTone } from '@shared/components/inline-message.types';

@Component({
  selector: 'app-inline-message',
  imports: [ButtonDirective],
  host: {
    class: 'block',
  },
  template: `
    <div
      class="rounded-[1.75rem] border p-4 text-sm"
      [class.border-rose-200]="tone() === 'error'"
      [class.bg-rose-50]="tone() === 'error'"
      [class.text-rose-700]="tone() === 'error'"
      [class.dark:border-rose-900]="tone() === 'error'"
      [class.dark:bg-rose-950/40]="tone() === 'error'"
      [class.dark:text-rose-200]="tone() === 'error'"
      [class.border-amber-200]="tone() === 'warning'"
      [class.bg-amber-50]="tone() === 'warning'"
      [class.text-amber-800]="tone() === 'warning'"
      [class.dark:border-amber-900]="tone() === 'warning'"
      [class.dark:bg-amber-950/40]="tone() === 'warning'"
      [class.dark:text-amber-200]="tone() === 'warning'"
      [class.border-slate-200]="tone() === 'info'"
      [class.bg-slate-50]="tone() === 'info'"
      [class.text-slate-700]="tone() === 'info'"
      [class.dark:border-slate-700]="tone() === 'info'"
      [class.dark:bg-slate-900/70]="tone() === 'info'"
      [class.dark:text-slate-200]="tone() === 'info'"
      [attr.aria-live]="tone() === 'error' ? 'assertive' : 'polite'"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="min-w-0 flex-1">{{ message() }}</p>

        @if (actionLabel()) {
          <button
            type="button"
            appButton="secondary"
            appButtonSize="xs"
            class="tracking-[0.16em] uppercase"
            [class.border-rose-300]="tone() === 'error'"
            [class.dark:border-rose-800]="tone() === 'error'"
            [class.border-amber-300]="tone() === 'warning'"
            [class.dark:border-amber-800]="tone() === 'warning'"
            [class.border-slate-300]="tone() === 'info'"
            [class.dark:border-slate-600]="tone() === 'info'"
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

  readonly action = output<void>();
}
