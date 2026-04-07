import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FeedbackStore } from '@core/stores/feedback.store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { InlineMessageComponent } from '@shared/components/inline-message.component';
import { ButtonDirective } from '@shared/directives/button-directive';
import { IfAdminDirective } from '@shared/directives/if-admin-directive';
import { Car } from '@shared/models/car.models';
import { getHttpErrorMessage } from '@shared/utils/http-error.utils';
import { CarsApiService } from '@features/cars/services/cars-api.service';

@Component({
  selector: 'app-car-detail-page',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonDirective,
    IfAdminDirective,
    InlineMessageComponent,
  ],
  templateUrl: './car-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly carsApi = inject(CarsApiService);
  private readonly dialog = inject(Dialog);
  private readonly feedbackStore = inject(FeedbackStore);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly car = signal<Car | null>(null);

  ngOnInit(): void {
    this.subscribeToCarDetail();
  }

  private subscribeToCarDetail(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => params.get('id')),
        switchMap((id) => {
          this.loading.set(true);
          this.errorMessage.set(null);
          this.car.set(null);

          return id ? this.carsApi.getCarById(id) : of(null);
        }),
      )
      .subscribe({
        next: (car) => {
          this.loading.set(false);
          this.car.set(car);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(getHttpErrorMessage(error, 'No se ha podido cargar el detalle.'));
        },
      });
  }

  protected deleteCar(): void {
    if (!this.car()) {
      return;
    }

    const carLabel = this.getCurrentCarLabel();

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      panelClass: 'vehicle-dialog-panel',
      backdropClass: 'vehicle-dialog-backdrop',
      data: {
        title: 'Eliminar coche',
        description: `Se eliminara ${carLabel} y cualquier documento vinculado.`,
        confirmLabel: 'Eliminar coche',
      },
    });

    dialogRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) =>
          confirmed ? this.carsApi.deleteCar(this.car()!.id).pipe(map(() => true)) : of(false),
        ),
      )
      .subscribe({
        next: (deleted) => {
          if (!deleted) {
            return;
          }

          this.feedbackStore.success('Coche eliminado correctamente.');
          void this.router.navigate(['/cars'], {
            queryParams: this.route.snapshot.queryParams,
          });
        },
        error: (error: unknown) => {
          this.feedbackStore.error(getHttpErrorMessage(error, 'No se ha podido borrar el coche.'));
        },
      });
  }

  private getCurrentCarLabel(): string {
    const car = this.car();
    if (!car) {
      return 'el coche seleccionado';
    }

    return `"${car.brand.name} ${car.model.name}"`;
  }
}
