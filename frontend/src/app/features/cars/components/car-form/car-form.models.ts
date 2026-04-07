import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CarCurrency } from '@shared/models/car.models';

export interface CarFormControls {
  brandId: FormControl<string>;
  modelId: FormControl<string>;
  carDetails: FormArray<CarDetailFormGroup>;
}

export type CarFormGroup = FormGroup<CarFormControls>;

export type CarDetailFormGroup = FormGroup<{
  registrationDate: FormControl<string>;
  mileage: FormControl<number>;
  currency: FormControl<CarCurrency>;
  price: FormControl<number>;
  manufactureYear: FormControl<number>;
  availability: FormControl<boolean>;
  color: FormControl<string>;
  description: FormControl<string>;
  licensePlate: FormControl<string>;
}>;
