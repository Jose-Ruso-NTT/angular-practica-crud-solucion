import {
  CURRENT_YEAR,
  MIN_MANUFACTURE_YEAR,
} from '@app/features/cars/components/car-form/car-form.config';

export const topLevelErrorMessages = {
  brandId: {
    required: 'La marca es obligatoria.',
  },
  modelId: {
    required: 'El modelo es obligatorio.',
  },
} as const;

export const detailErrorMessages = {
  registrationDate: {
    required: 'La fecha de matriculación es obligatoria.',
  },
  mileage: {
    required: 'El kilometraje es obligatorio.',
    min: 'El kilometraje no puede ser negativo.',
  },
  price: {
    required: 'El precio es obligatorio.',
    greaterThanZero: 'El precio debe ser mayor que cero.',
  },
  manufactureYear: {
    integer: 'El año de fabricación debe ser un numero entero.',
    required: 'El año de fabricación es obligatorio.',
    min: `El año de fabricación no puede ser anterior a ${MIN_MANUFACTURE_YEAR}.`,
    max: `El año de fabricación no puede ser posterior a ${CURRENT_YEAR}.`,
  },
  description: {
    maxlength: (error: unknown) =>
      `La descripción no puede superar los ${(error as { requiredLength: number }).requiredLength} caracteres.`,
  },
  licensePlate: {
    required: 'La matrícula es obligatoria.',
    pattern: 'La matrícula debe tener formato español, por ejemplo 1234 BBB.',
    duplicateLicensePlate: 'Esta matrícula ya está registrada en otro coche.',
    duplicateLicensePlateInRequest: 'Esta matrícula está repetida en otra unidad del formulario.',
  },
} as const;

export const detailGroupErrorMessages = {
  manufactureYearAfterRegistration:
    'El año de fabricación no puede ser posterior a la fecha de matriculación.',
} as const;
