import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  CURRENT_YEAR,
  DUPLICATE_LICENSE_PLATE_ERROR_CODE,
  DUPLICATE_LICENSE_PLATE_IN_REQUEST_ERROR_CODE,
  LICENSE_PLATE_REGEX,
  LICENSE_PLATE_SERVER_ERROR_KEYS,
  MIN_MANUFACTURE_YEAR,
} from '@app/features/cars/components/car-form/car-form.config';
import { CarFormMode } from '@features/cars/car-form.types';
import { CarDetailUnitComponent } from '@features/cars/components/car-form/car-detail-unit.component';
import {
  detailErrorMessages,
  detailGroupErrorMessages,
  topLevelErrorMessages,
} from '@features/cars/components/car-form/car-form-messages';
import {
  CarDetailFormGroup,
  CarFormControls,
  CarFormGroup,
} from '@features/cars/components/car-form/car-form.models';
import {
  greaterThanZeroValidator,
  integerValidator,
  manufactureYearValidator,
} from '@features/cars/components/car-form/car-form.validators';
import { CatalogStore } from '@features/cars/services/catalog.store';
import { FormFieldErrorsComponent } from '@shared/components/form-field-errors.component';
import { InlineMessageComponent } from '@shared/components/inline-message.component';
import { ButtonDirective } from '@shared/directives/button-directive';
import { CAR_CURRENCIES, Car, CarDetail, CreateCarRequest } from '@shared/models/car.models';
import { isoToLocalDateTimeInput, localDateTimeInputToIso } from '@shared/utils/date.utils';
import { BackendErrorCode } from '@shared/utils/http-error.utils';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-car-form',
  imports: [
    ReactiveFormsModule,
    FormFieldErrorsComponent,
    InlineMessageComponent,
    ButtonDirective,
    CarDetailUnitComponent,
  ],
  templateUrl: './car-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly catalogStore = inject(CatalogStore);

  readonly mode = input<CarFormMode>('create');
  readonly car = input<Car | null>(null);
  readonly pending = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly errorCode = input<BackendErrorCode | null>(null);
  readonly errorLicensePlate = input<string | null>(null);
  readonly submitLabel = input('Guardar coche');

  readonly submitCar = output<CreateCarRequest>();
  readonly cancelForm = output<void>();

  protected readonly currencies = CAR_CURRENCIES;
  protected readonly topLevelErrorMessages = topLevelErrorMessages;
  protected readonly detailErrorMessages = detailErrorMessages;
  protected readonly detailGroupErrorMessages = detailGroupErrorMessages;

  protected readonly form: CarFormGroup = this.fb.group<CarFormControls>({
    brandId: this.fb.control('', { validators: Validators.required }),
    modelId: this.fb.control('', { validators: Validators.required }),
    carDetails: this.fb.array<CarDetailFormGroup>([]),
  });

  private readonly brandIdSignal = toSignal(
    this.form.controls.brandId.valueChanges.pipe(startWith(this.form.controls.brandId.value)),
    { initialValue: this.form.controls.brandId.value ?? '' },
  );

  protected readonly availableModels = computed(() =>
    this.catalogStore.getModelsForBrand(this.brandIdSignal() ?? ''),
  );
  private readonly detailsStatusSignal = toSignal(
    this.form.controls.carDetails.statusChanges.pipe(
      startWith(this.form.controls.carDetails.status),
    ),
    { initialValue: this.form.controls.carDetails.status },
  );
  protected readonly canAddDetail = computed(() => {
    this.detailsStatusSignal();
    const details = this.detailControls.controls;
    if (details.length === 0) {
      return true;
    }

    return details[details.length - 1]?.valid ?? true;
  });
  protected readonly visibleGlobalErrorMessage = computed(() => {
    return this.isLicensePlateConflict(this.errorCode()) ? null : this.errorMessage();
  });

  constructor() {
    effect(() => this.syncFormWithCurrentCar());
    effect(() => this.syncLicensePlateConflictErrors());
  }

  ngOnInit(): void {
    this.loadCatalog();
    this.subscribeToBrandChanges();
  }

  protected get detailControls(): FormArray<CarDetailFormGroup> {
    return this.form.controls.carDetails;
  }

  protected addDetail(): void {
    const lastDetail = this.detailControls.at(this.detailControls.length - 1);
    if (lastDetail && lastDetail.invalid) {
      lastDetail.markAllAsTouched();
      return;
    }

    this.detailControls.push(this.createDetailGroup());
  }

  protected removeDetail(index: number): void {
    this.detailControls.removeAt(index);
    this.syncLicensePlateConflictErrors();
  }

  protected shouldShowError(control: AbstractControl | null): boolean {
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty);
  }

  protected handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitCar.emit(this.buildPayload());
  }

  private createDetailGroup(detail?: CarDetail | null): CarDetailFormGroup {
    const group = this.fb.group<CarDetailFormGroup['controls']>(
      {
        registrationDate: this.fb.control(
          detail?.registrationDate ? isoToLocalDateTimeInput(detail.registrationDate) : '',
          { validators: [Validators.required] },
        ),
        mileage: this.fb.control(detail?.mileage ?? 0, {
          validators: [Validators.required, Validators.min(0)],
        }),
        currency: this.fb.control(detail?.currency ?? 'EUR'),
        price: this.fb.control(detail?.price ?? 1, {
          validators: [Validators.required, greaterThanZeroValidator],
        }),
        manufactureYear: this.fb.control(detail?.manufactureYear ?? CURRENT_YEAR, {
          validators: [
            Validators.required,
            integerValidator,
            Validators.min(MIN_MANUFACTURE_YEAR),
            Validators.max(CURRENT_YEAR),
          ],
        }),
        availability: this.fb.control(detail?.availability ?? true),
        color: this.fb.control(detail?.color ?? ''),
        description: this.fb.control(detail?.description ?? '', {
          validators: [Validators.maxLength(1000)],
        }),
        licensePlate: this.fb.control(detail?.licensePlate ?? '', {
          validators: [Validators.required, Validators.pattern(LICENSE_PLATE_REGEX)],
        }),
      },
      {
        validators: [manufactureYearValidator],
      },
    );

    group.controls.licensePlate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearServerErrorsFromControl(group.controls.licensePlate);
      });

    return group;
  }

  private loadCatalog(): void {
    this.catalogStore.loadCatalog().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private subscribeToBrandChanges(): void {
    this.form.controls.brandId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((brandId: string) => this.handleBrandChange(brandId));
  }

  private handleBrandChange(brandId: string): void {
    if (!brandId) {
      this.form.controls.modelId.setValue('');
      return;
    }

    void this.catalogStore
      .loadModelsByBrand(brandId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncSelectedModelWithBrand(brandId));
  }

  private syncSelectedModelWithBrand(brandId: string): void {
    const exists = this.catalogStore
      .getModelsForBrand(brandId)
      .some((model) => model.id === this.form.controls.modelId.value);

    if (!exists) {
      this.form.controls.modelId.setValue('');
    }
  }

  private buildPayload(): CreateCarRequest {
    return {
      brandId: this.form.controls.brandId.getRawValue(),
      modelId: this.form.controls.modelId.getRawValue(),
      carDetails: this.detailControls.controls.map((group) => ({
        registrationDate: localDateTimeInputToIso(group.controls.registrationDate.getRawValue()),
        mileage: Number(group.controls.mileage.getRawValue()),
        currency: group.controls.currency.getRawValue(),
        price: Number(group.controls.price.getRawValue()),
        manufactureYear: Number(group.controls.manufactureYear.getRawValue()),
        availability: group.controls.availability.getRawValue(),
        color: group.controls.color.getRawValue().trim() || undefined,
        description: group.controls.description.getRawValue().trim() || undefined,
        licensePlate: this.normalizeLicensePlate(group.controls.licensePlate.getRawValue()),
      })),
    };
  }

  private syncFormWithCurrentCar(): void {
    const currentCar = this.car();
    if (!currentCar) {
      if (this.detailControls.length === 0) {
        this.addDetail();
      }
      return;
    }

    this.form.patchValue({
      brandId: currentCar.brand.id,
      modelId: currentCar.model.id,
    });

    this.detailControls.clear();
    const details = currentCar.carDetails?.length ? currentCar.carDetails : [null];
    for (const detail of details) {
      this.detailControls.push(this.createDetailGroup(detail));
    }

    this.clearLicensePlateServerErrors();
  }

  private syncLicensePlateConflictErrors(): void {
    const errorCode = this.errorCode();
    const errorLicensePlate = this.errorLicensePlate();

    this.clearLicensePlateServerErrors();

    if (!this.isLicensePlateConflict(errorCode)) {
      return;
    }

    const matchingControls = this.detailControls.controls
      .map((group) => group.controls.licensePlate)
      .filter((control) =>
        errorLicensePlate
          ? this.normalizeLicensePlate(control.getRawValue()) ===
            this.normalizeLicensePlate(errorLicensePlate)
          : true,
      );

    const controlsToMark =
      matchingControls.length > 1
        ? [this.pickMostRelevantLicensePlateControl(matchingControls)]
        : matchingControls;

    for (const control of controlsToMark) {
      this.setControlError(control, this.getLicensePlateErrorKey(errorCode), true);
      control.markAsTouched();
    }
  }

  private pickMostRelevantLicensePlateControl(
    controls: FormControl<string>[],
  ): FormControl<string> {
    const dirtyControls = controls.filter((control) => control.dirty);
    if (dirtyControls.length > 0) {
      return dirtyControls[dirtyControls.length - 1]!;
    }

    const touchedControls = controls.filter((control) => control.touched);
    if (touchedControls.length > 0) {
      return touchedControls[touchedControls.length - 1]!;
    }

    return controls[controls.length - 1]!;
  }

  private clearLicensePlateServerErrors(): void {
    for (const group of this.detailControls.controls) {
      this.clearServerErrorsFromControl(group.controls.licensePlate);
    }
  }

  private clearServerErrorsFromControl(control: AbstractControl): void {
    let nextErrors = control.errors;

    for (const errorKey of LICENSE_PLATE_SERVER_ERROR_KEYS) {
      nextErrors = this.removeControlError(nextErrors, errorKey);
    }

    control.setErrors(nextErrors);
  }

  private setControlError(control: AbstractControl, errorKey: string, value: true): void {
    control.setErrors({
      ...(control.errors ?? {}),
      [errorKey]: value,
    });
  }

  private removeControlError(
    errors: ValidationErrors | null,
    errorKey: string,
  ): ValidationErrors | null {
    if (!errors || !(errorKey in errors)) {
      return errors;
    }

    const { [errorKey]: removedError, ...remainingErrors } = errors;
    void removedError;
    return Object.keys(remainingErrors).length > 0 ? remainingErrors : null;
  }

  private normalizeLicensePlate(value: string): string {
    return value.replace(/\s+/g, '').trim().toUpperCase();
  }

  private isLicensePlateConflict(errorCode: BackendErrorCode | null): boolean {
    return (
      errorCode === DUPLICATE_LICENSE_PLATE_ERROR_CODE ||
      errorCode === DUPLICATE_LICENSE_PLATE_IN_REQUEST_ERROR_CODE
    );
  }

  private getLicensePlateErrorKey(
    errorCode: BackendErrorCode | null,
  ): (typeof LICENSE_PLATE_SERVER_ERROR_KEYS)[number] {
    return errorCode === DUPLICATE_LICENSE_PLATE_IN_REQUEST_ERROR_CODE
      ? 'duplicateLicensePlateInRequest'
      : 'duplicateLicensePlate';
  }
}
