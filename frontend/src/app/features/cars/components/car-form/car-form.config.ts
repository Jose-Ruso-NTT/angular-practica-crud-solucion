export const LICENSE_PLATE_REGEX = /^[0-9]{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
export const MIN_MANUFACTURE_YEAR = 1900;
export const CURRENT_YEAR = new Date().getFullYear();
export const DUPLICATE_LICENSE_PLATE_ERROR_CODE = 'CAR_DUPLICATE_LICENSE_PLATE';
export const DUPLICATE_LICENSE_PLATE_IN_REQUEST_ERROR_CODE =
  'CAR_DUPLICATE_LICENSE_PLATE_IN_REQUEST';
export const LICENSE_PLATE_SERVER_ERROR_KEYS = [
  'duplicateLicensePlate',
  'duplicateLicensePlateInRequest',
] as const;
