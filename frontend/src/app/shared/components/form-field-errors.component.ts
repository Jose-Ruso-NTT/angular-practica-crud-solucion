import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

type ValidationMessage = string | ((error: unknown) => string);

@Component({
  selector: 'app-form-field-errors',
  template: `
    @if (visibleMessage(); as message) {
      <p class="text-sm text-rose-600 dark:text-rose-300" aria-live="polite">{{ message }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldErrorsComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly messages = input<Record<string, ValidationMessage>>({});

  private readonly controlEvents = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) => (control ? control.events.pipe(startWith(null)) : of(null))),
    ),
    { initialValue: null },
  );

  protected readonly visibleMessage = computed(() => {
    this.controlEvents();
    const control = this.control();

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return null;
    }

    const errors = control.errors ?? {};

    for (const [errorKey, message] of Object.entries(this.messages())) {
      if (!(errorKey in errors)) {
        continue;
      }

      return typeof message === 'function' ? message(errors[errorKey]) : message;
    }

    return null;
  });
}
