import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Brand, BrandModel } from '@shared/models/brand.models';

@Injectable({ providedIn: 'root' })
export class BrandsApiService {
  private readonly http = inject(HttpClient);

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${API_BASE_URL}/brands`);
  }

  getModelsByBrand(brandId: string): Observable<BrandModel[]> {
    return this.http.get<BrandModel[]>(`${API_BASE_URL}/brands/${brandId}/models`);
  }
}
