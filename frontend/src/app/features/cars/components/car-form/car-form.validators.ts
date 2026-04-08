import { AbstractControl, ValidationErrors } from '@angular/forms';
import { extractYearFromDateTimeInput } from '@shared/utils/date.utils';

export function manufactureYearValidator(control: AbstractControl): ValidationErrors | null {
  const registrationDate = control.get('registrationDate')?.value;
  const manufactureYear = Number(control.get('manufactureYear')?.value);

  if (!registrationDate || !manufactureYear) {
    return null;
  }

  const registrationYear = extractYearFromDateTimeInput(registrationDate);
  if (registrationYear === null) {
    return null;
  }

  if (manufactureYear > registrationYear) {
    return { manufactureYearAfterRegistration: true };
  }

  return null;
}

export function integerValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Number.isInteger(Number(value)) ? null : { integer: true };
}

export function greaterThanZeroValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Number(value) > 0 ? null : { greaterThanZero: true };
}
