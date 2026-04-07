import { FormControl, FormGroup } from '@angular/forms';
import { SortOrder } from '@shared/models/car.models';

export interface CarsListFiltersFormControls {
  brandId: FormControl<string>;
  modelId: FormControl<string>;
  sortBy: FormControl<string>;
  sortOrder: FormControl<SortOrder>;
  page: FormControl<number>;
  limit: FormControl<number>;
}

export type CarsListFiltersFormGroup = FormGroup<CarsListFiltersFormControls>;
