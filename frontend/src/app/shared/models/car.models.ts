import { PaginatedResponse } from '@shared/models/pagination.models';

export const CAR_SORT_FIELDS = [
  'brandId',
  'modelId',
  'total',
  'price',
  'manufactureYear',
  'registrationDate',
  'mileage',
  'licensePlate',
  'availability',
] as const;

export const CAR_DOCUMENT_TYPES = [
  'invoice',
  'inspection',
  'insurance',
  'registration',
  'other',
] as const;

export const CAR_CURRENCIES = [
  'EUR',
  'GBP',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'HRK',
  'ARS',
  'BRL',
  'CLP',
  'COP',
  'PEN',
  'UYU',
  'PYG',
  'BOB',
  'VES',
  'USD',
  'CAD',
  'MXN',
  'JPY',
  'CNY',
  'INR',
  'KRW',
  'SGD',
  'HKD',
  'MYR',
  'IDR',
  'THB',
  'VND',
  'PKR',
  'AUD',
  'NZD',
  'ZAR',
  'EGP',
  'NGN',
  'KES',
  'GHS',
] as const;

export type CarSortField = (typeof CAR_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';
export type CarDocumentType = (typeof CAR_DOCUMENT_TYPES)[number];
export type CarCurrency = (typeof CAR_CURRENCIES)[number];

export interface CarDetail {
  registrationDate: string;
  mileage: number;
  currency?: CarCurrency;
  price: number;
  manufactureYear: number;
  availability?: boolean;
  color?: string;
  description?: string;
  licensePlate: string;
  imageUrl: string;
}

export interface CarBrandSummary {
  id: string;
  name: string;
}

export interface CarModelSummary {
  id: string;
  name: string;
}

export interface CarSummary {
  id: string;
  brand: CarBrandSummary;
  model: CarModelSummary;
  total?: number;
  imageUrl?: string;
}

export interface Car extends CarSummary {
  carDetails?: CarDetail[];
}

export interface CarDetailPayload {
  registrationDate: string;
  mileage: number;
  currency?: CarCurrency;
  price: number;
  manufactureYear: number;
  availability?: boolean;
  color?: string;
  description?: string;
  licensePlate: string;
}

export interface CreateCarRequest {
  brandId: string;
  modelId: string;
  carDetails?: CarDetailPayload[];
}

export type UpdateCarRequest = CreateCarRequest;

export interface CarsFilters {
  page?: number;
  limit?: number;
  brandId?: string;
  modelId?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  available?: boolean;
  licensePlate?: string;
  sortBy?: CarSortField;
  sortOrder?: SortOrder;
}

export interface CarDocument {
  id: string;
  carId: string;
  originalName: string;
  mimeType: string;
  size: number;
  documentType: CarDocumentType;
  title?: string;
  description?: string;
  uploadedAt: string;
  persisted: boolean;
  downloadUrl: string;
  message: string;
}

export interface UploadCarDocumentRequest {
  title?: string;
  documentType?: CarDocumentType;
  description?: string;
  file: File;
}

export type CarsResponse = PaginatedResponse<CarSummary>;
