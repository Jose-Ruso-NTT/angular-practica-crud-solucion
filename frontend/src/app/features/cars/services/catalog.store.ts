import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Brand, BrandModel } from '@shared/models/brand.models';
import { BrandsApiService } from '@features/cars/services/brands-api.service';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly brandsApi = inject(BrandsApiService);

  readonly brands = signal<Brand[]>([]);
  readonly modelsByBrand = signal<Record<string, BrandModel[]>>({});
  readonly catalogLoaded = computed(
    () => this.brands().length > 0 && Object.keys(this.modelsByBrand()).length > 0,
  );

  loadCatalog(): Observable<void> {
    if (this.catalogLoaded()) {
      return of(void 0);
    }

    return this.brandsApi.getBrands().pipe(
      tap((brands) => this.brands.set(brands)),
      switchMap((brands) => {
        if (!brands.length) {
          return of([]);
        }

        return forkJoin(
          brands.map((brand) =>
            this.brandsApi.getModelsByBrand(brand.id).pipe(
              tap((models) => {
                this.modelsByBrand.update((current) => ({
                  ...current,
                  [brand.id]: models,
                }));
              }),
            ),
          ),
        );
      }),
      map(() => void 0),
    );
  }

  loadModelsByBrand(brandId: string): Observable<BrandModel[]> {
    const cached = this.modelsByBrand()[brandId];
    if (cached) {
      return of(cached);
    }

    return this.brandsApi.getModelsByBrand(brandId).pipe(
      tap((models) => {
        this.modelsByBrand.update((current) => ({
          ...current,
          [brandId]: models,
        }));
      }),
    );
  }

  getModelsForBrand(brandId: string): BrandModel[] {
    return this.modelsByBrand()[brandId] ?? [];
  }
}
