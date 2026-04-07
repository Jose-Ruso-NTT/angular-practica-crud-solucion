import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { FeedbackStore } from '@core/stores/feedback.store';
import { LoginFormControls, LoginFormGroup } from '@features/auth/login-page.models';
import { ButtonDirective } from '@shared/directives/button-directive';
import { getHttpErrorMessage } from '@shared/utils/http-error.utils';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, ButtonDirective],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly feedbackStore = inject(FeedbackStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form: LoginFormGroup = this.fb.nonNullable.group<LoginFormControls>({
    email: this.fb.nonNullable.control('admin@example.com', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.nonNullable.control('admin123', { validators: [Validators.required] }),
  });

  protected submit(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.pending.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authStore
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pending.set(false);
          this.feedbackStore.success('Sesión iniciada correctamente.');
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/cars';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.pending.set(false);
          this.errorMessage.set(getHttpErrorMessage(error, 'No se ha podido iniciar sesión.'));
        },
      });
  }
}
