import { ParamMap } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '@core/config/api.config';
import { CarsFilters, CarSortField, SortOrder } from '@shared/models/car.models';

export interface CarsFilterFormValue {
  brandId: string;
  modelId: string;
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface SortOption {
  value: CarSortField;
  label: string;
}

export type PaginationItem = number | 'ellipsis';

export type CarsListQueryParams = Record<string, string | number | boolean>;

export const VISIBLE_SORT_OPTIONS: SortOption[] = [
  { value: 'brandId', label: 'Marca' },
  { value: 'modelId', label: 'Modelo' },
  { value: 'total', label: 'Total' },
];

export function queryParamsToFormValue(queryParamMap: ParamMap): CarsFilterFormValue {
  return {
    brandId: queryParamMap.get('brandId') ?? '',
    modelId: queryParamMap.get('modelId') ?? '',
    sortBy: queryParamMap.get('sortBy') ?? '',
    sortOrder: (queryParamMap.get('sortOrder') as SortOrder | null) ?? 'asc',
    page: Number(queryParamMap.get('page') ?? 1),
    limit: Number(queryParamMap.get('limit') ?? DEFAULT_PAGE_SIZE),
  };
}

export function formValueToFilters(formValue: CarsFilterFormValue): CarsFilters {
  return {
    brandId: formValue.brandId || undefined,
    modelId: formValue.modelId || undefined,
    sortBy: (formValue.sortBy as CarSortField) || undefined,
    sortOrder: formValue.sortBy ? formValue.sortOrder : undefined,
    page: formValue.page,
    limit: formValue.limit,
  };
}

export function serializeFormValue(formValue: CarsFilterFormValue): CarsListQueryParams {
  const filters = formValueToFilters(formValue);
  const queryParams: CarsListQueryParams = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    queryParams[key] = value;
  }

  return queryParams;
}

export function haveFiltersChanged(
  previousValue: CarsFilterFormValue,
  currentValue: CarsFilterFormValue,
): boolean {
  return (
    previousValue.brandId !== currentValue.brandId ||
    previousValue.modelId !== currentValue.modelId ||
    previousValue.sortBy !== currentValue.sortBy ||
    previousValue.sortOrder !== currentValue.sortOrder ||
    previousValue.limit !== currentValue.limit
  );
}

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const validPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: PaginationItem[] = [];

  for (const page of validPages) {
    const previous = items.at(-1);
    if (typeof previous === 'number' && page - previous > 1) {
      items.push('ellipsis');
    }

    items.push(page);
  }

  return items;
}
