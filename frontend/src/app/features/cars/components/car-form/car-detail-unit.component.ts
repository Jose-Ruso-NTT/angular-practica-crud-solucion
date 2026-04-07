import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  detailErrorMessages,
  detailGroupErrorMessages,
} from '@features/cars/components/car-form/car-form-messages';
import { CarDetailFormGroup } from '@features/cars/components/car-form/car-form.models';
import { FormFieldErrorsComponent } from '@shared/components/form-field-errors.component';
import { ButtonDirective } from '@shared/directives/button-directive';

@Component({
  selector: 'app-car-detail-unit',
  imports: [ReactiveFormsModule, FormFieldErrorsComponent, ButtonDirective],
  templateUrl: './car-detail-unit.component.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailUnitComponent {
  readonly group = input.required<CarDetailFormGroup>();
  readonly index = input.required<number>();
  readonly currencies = input.required<readonly string[]>();
  readonly canRemove = input(false);
  readonly showLicensePlateError = input(false);

  readonly remove = output<void>();

  protected readonly detailErrorMessages = detailErrorMessages;
  protected readonly detailGroupErrorMessages = detailGroupErrorMessages;
}
