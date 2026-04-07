import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/config/api.config';
import {
  Car,
  CarsFilters,
  CarsResponse,
  CreateCarRequest,
  UpdateCarRequest,
} from '@shared/models/car.models';
import { Observable } from 'rxjs';

function buildParams(filters: CarsFilters): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}

@Injectable({ providedIn: 'root' })
export class CarsApiService {
  private readonly http = inject(HttpClient);

  getCars(filters: CarsFilters): Observable<CarsResponse> {
    return this.http.get<CarsResponse>(`${API_BASE_URL}/cars`, {
      params: buildParams(filters),
    });
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${API_BASE_URL}/cars/${id}`);
  }

  createCar(payload: CreateCarRequest): Observable<Car> {
    return this.http.post<Car>(`${API_BASE_URL}/cars`, payload);
  }

  updateCar(id: string, payload: UpdateCarRequest): Observable<Car> {
    return this.http.put<Car>(`${API_BASE_URL}/cars/${id}`, payload);
  }

  deleteCar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/cars/${id}`);
  }

  exportCars(filters: CarsFilters): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/cars/export/excel`, {
      params: buildParams(filters),
      responseType: 'blob',
    });
  }
}
