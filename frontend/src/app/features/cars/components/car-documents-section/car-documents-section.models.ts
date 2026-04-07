import { FormControl, FormGroup } from '@angular/forms';
import { CarDocumentType } from '@shared/models/car.models';

export interface CarDocumentUploadFormControls {
  title: FormControl<string>;
  documentType: FormControl<CarDocumentType>;
  description: FormControl<string>;
}

export type CarDocumentUploadFormGroup = FormGroup<CarDocumentUploadFormControls>;
