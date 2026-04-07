import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FeedbackStore } from '@core/stores/feedback.store';
import { Car, CreateCarRequest } from '@shared/models/car.models';
import {
  BackendErrorCode,
  getHttpErrorCode,
  getHttpErrorLicensePlate,
  getHttpErrorMessage,
} from '@shared/utils/http-error.utils';
import { CarFormMode } from '@features/cars/car-form.types';
import { CarFormComponent } from '@features/cars/components/car-form/car-form.component';
import { CarsApiService } from '@features/cars/services/cars-api.service';

@Component({
  selector: 'app-car-form-page',
  imports: [RouterLink, CarFormComponent],
  templateUrl: 'car-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly carsApi = inject(CarsApiService);
  private readonly feedbackStore = inject(FeedbackStore);

  protected readonly mode = signal<CarFormMode>(
    (this.route.snapshot.data['mode'] as CarFormMode) ?? 'create',
  );
  protected readonly loading = signal(this.mode() === 'edit');
  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorCode = signal<BackendErrorCode | null>(null);
  protected readonly errorLicensePlate = signal<string | null>(null);
  protected readonly car = signal<Car | null>(null);

  protected readonly title = computed(() =>
    this.mode() === 'create' ? 'Nuevo coche' : 'Editar coche',
  );
  protected readonly subtitle = computed(() =>
    this.mode() === 'create'
      ? 'Crea una entrada completa alineada con el contrato real del backend.'
      : 'Edita el coche reutilizando el mismo formulario reactivo.',
  );
  protected readonly submitLabel = computed(() =>
    this.mode() === 'create' ? 'Crear coche' : 'Guardar cambios',
  );

  ngOnInit(): void {
    this.subscribeToCar();
  }

  private subscribeToCar(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          if (this.mode() !== 'edit') {
            this.loading.set(false);
            return of(null);
          }

          this.loading.set(true);

          const id = params.get('id');
          if (!id) {
            this.loading.set(false);
            return of(null);
          }

          return this.carsApi.getCarById(id);
        }),
      )
      .subscribe({
        next: (car) => {
          this.loading.set(false);
          this.car.set(car);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(getHttpErrorMessage(error, 'No se ha podido cargar el coche.'));
        },
      });
  }

  protected save(payload: CreateCarRequest): void {
    this.pending.set(true);
    this.errorMessage.set(null);
    this.errorCode.set(null);
    this.errorLicensePlate.set(null);

    const request$ =
      this.mode() === 'create' || !this.car()
        ? this.carsApi.createCar(payload)
        : this.carsApi.updateCar(this.car()!.id, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (car) => {
        this.pending.set(false);
        this.feedbackStore.success(
          this.mode() === 'create'
            ? 'Coche creado correctamente.'
            : 'Coche actualizado correctamente.',
        );
        void this.router.navigate(['/cars', car.id, 'overview'], {
          queryParams: this.route.snapshot.queryParams,
        });
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.errorCode.set(getHttpErrorCode(error));
        this.errorLicensePlate.set(getHttpErrorLicensePlate(error));
        this.errorMessage.set(getHttpErrorMessage(error, 'No se ha podido guardar el coche.'));
      },
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/cars'], {
      queryParams: this.route.snapshot.queryParams,
    });
  }
}
