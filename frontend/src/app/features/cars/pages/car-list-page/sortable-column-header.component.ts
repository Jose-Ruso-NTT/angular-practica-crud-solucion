import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type SortIndicator = 'none' | 'asc' | 'desc';

@Component({
  selector: 'app-sortable-column-header',
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-slate-200/70 focus:ring-4 focus:ring-teal-100 focus:outline-none"
      [attr.aria-label]="ariaLabel()"
      (click)="sort.emit()"
    >
      <span>{{ label() }}</span>
      <span
        class="inline-flex h-4 w-4 items-center justify-center"
        [class.text-teal-700]="indicator() !== 'none'"
        [class.text-slate-400]="indicator() === 'none'"
      >
        @switch (indicator()) {
          @case ('asc') {
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            >
              <path d="M10 15V5" />
              <path d="M6.5 8.5 10 5l3.5 3.5" />
            </svg>
          }
          @case ('desc') {
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            >
              <path d="M10 5v10" />
              <path d="M6.5 11.5 10 15l3.5-3.5" />
            </svg>
          }
          @default {
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            >
              <path d="M6.5 14V10" />
              <path d="M4.5 12l2-2 2 2" />
              <path d="M13.5 6v4" />
              <path d="m11.5 8 2 2 2-2" />
            </svg>
          }
        }
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableColumnHeaderComponent {
  readonly label = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly indicator = input<SortIndicator>('none');
  readonly sort = output<void>();
}
