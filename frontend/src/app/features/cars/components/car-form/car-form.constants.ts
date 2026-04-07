import { AbstractControl, ValidationErrors } from '@angular/forms';
import { extractYearFromDateTimeInput } from '@shared/utils/date.utils';

export const LICENSE_PLATE_REGEX = /^[0-9]{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
export const CURRENT_YEAR = new Date().getFullYear();
export const DUPLICATE_LICENSE_PLATE_ERROR_CODE = 'CAR_DUPLICATE_LICENSE_PLATE';
export const DUPLICATE_LICENSE_PLATE_IN_REQUEST_ERROR_CODE =
  'CAR_DUPLICATE_LICENSE_PLATE_IN_REQUEST';
export const LICENSE_PLATE_SERVER_ERROR_KEYS = [
  'duplicateLicensePlate',
  'duplicateLicensePlateInRequest',
] as const;

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
