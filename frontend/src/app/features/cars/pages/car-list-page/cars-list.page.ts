import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '@core/config/api.config';
import { AuthStore } from '@core/stores/auth.store';
import { FeedbackStore } from '@core/stores/feedback.store';
import {
  CarsListFiltersFormControls,
  CarsListFiltersFormGroup,
} from '@features/cars/pages/car-list-page/cars-list-page.models';
import {
  buildPaginationItems,
  CarsFilterFormValue,
  CarsListQueryParams,
  formValueToFilters,
  haveFiltersChanged,
  PaginationItem,
  queryParamsToFormValue,
  serializeFormValue,
  VISIBLE_SORT_OPTIONS,
} from '@features/cars/pages/car-list-page/cars-list-page.utils';
import { SortableColumnHeaderComponent } from '@features/cars/pages/car-list-page/sortable-column-header.component';
import { CarsApiService } from '@features/cars/services/cars-api.service';
import { CatalogStore } from '@features/cars/services/catalog.store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { InlineMessageComponent } from '@shared/components/inline-message.component';
import { ButtonDirective } from '@shared/directives/button-directive';
import { IfAdminDirective } from '@shared/directives/if-admin-directive';
import { CarSortField, CarsResponse, CarSummary, SortOrder } from '@shared/models/car.models';
import { downloadBlob } from '@shared/utils/file-download.utils';
import { getHttpErrorMessage } from '@shared/utils/http-error.utils';
import { merge, of, pairwise, startWith, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-cars-list-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IfAdminDirective,
    InlineMessageComponent,
    ButtonDirective,
    SortableColumnHeaderComponent,
  ],
  templateUrl: './car-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsListPage implements OnInit {
  protected readonly viewMode = signal<'table' | 'cards'>('table');

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly carsApi = inject(CarsApiService);
  protected readonly catalogStore = inject(CatalogStore);
  private readonly feedbackStore = inject(FeedbackStore);
  private readonly dialog = inject(Dialog);
  protected readonly authStore = inject(AuthStore);

  protected readonly loading = signal(true);
  protected readonly exporting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly carsResponse = signal<CarsResponse | null>(null);
  protected readonly currentModels = signal(this.catalogStore.getModelsForBrand(''));
  protected readonly paginationItems = signal<PaginationItem[]>([]);

  protected readonly sortOptions = VISIBLE_SORT_OPTIONS;

  private readonly refreshTrigger$ = new Subject<void>();

  protected readonly filtersForm: CarsListFiltersFormGroup =
    this.fb.group<CarsListFiltersFormControls>({
      brandId: this.fb.control(''),
      modelId: this.fb.control(''),
      sortBy: this.fb.control(''),
      sortOrder: this.fb.control('asc' as SortOrder),
      page: this.fb.control(1),
      limit: this.fb.control(DEFAULT_PAGE_SIZE),
    });

  ngOnInit(): void {
    this.loadCatalog();
    this.subscribeToCars();
    this.subscribeToBrandChanges();
    this.subscribeToFormChanges();
  }

  protected reload(): void {
    this.refreshTrigger$.next();
  }

  protected resetFilters(): void {
    this.filtersForm.setValue({
      brandId: '',
      modelId: '',
      sortBy: '',
      sortOrder: 'asc',
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  }

  protected goToPage(page: number): void {
    this.filtersForm.controls.page.setValue(page);
  }

  protected toggleSort(field: CarSortField): void {
    const sortByControl = this.filtersForm.controls.sortBy;
    const sortOrderControl = this.filtersForm.controls.sortOrder;

    if (sortByControl.value !== field) {
      sortByControl.setValue(field);
      sortOrderControl.setValue('asc');
    } else if (sortOrderControl.value === 'asc') {
      sortOrderControl.setValue('desc');
    } else {
      sortByControl.setValue('');
      sortOrderControl.setValue('asc');
    }

    this.filtersForm.controls.page.setValue(1);
  }

  protected isSortedBy(field: CarSortField): boolean {
    return this.filtersForm.controls.sortBy.value === field;
  }

  protected getSortIndicator(field: CarSortField): 'none' | 'asc' | 'desc' {
    if (!this.isSortedBy(field)) {
      return 'none';
    }

    return this.filtersForm.controls.sortOrder.value === 'asc' ? 'asc' : 'desc';
  }

  protected getSortAriaLabel(field: CarSortField, label: string): string {
    if (!this.isSortedBy(field)) {
      return `Ordenar por ${label} ascendente`;
    }

    return this.filtersForm.controls.sortOrder.value === 'asc'
      ? `Ordenar por ${label} descendente`
      : `Quitar orden por ${label}`;
  }

  protected getResultsSummary(): string {
    const response = this.carsResponse();
    if (!response) {
      return '';
    }

    return `${response.meta.totalItems} coches encontrados`;
  }

  protected getResultsRangeLabel(): string {
    const response = this.carsResponse();
    if (!response) {
      return '';
    }

    const { currentPage, itemsPerPage, itemCount, totalItems } = response.meta;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = startItem + itemCount - 1;

    return `Mostrando ${startItem}-${endItem} de ${totalItems} resultados`;
  }

  protected setViewMode(viewMode: 'table' | 'cards'): void {
    this.viewMode.set(viewMode);
  }

  private getCarLabel(car: CarSummary): string {
    return `"${car.brand.name} ${car.model.name}"`;
  }

  protected deleteCar(car: CarSummary): void {
    const carLabel = this.getCarLabel(car);

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      panelClass: 'vehicle-dialog-panel',
      backdropClass: 'vehicle-dialog-backdrop',
      data: {
        title: 'Eliminar coche',
        description: `Se eliminara ${carLabel} de la lista actual. El backend trabaja en memoria.`,
        confirmLabel: 'Eliminar',
      },
    });

    dialogRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(false);
          }

          return this.carsApi.deleteCar(car.id).pipe(map(() => true));
        }),
      )
      .subscribe({
        next: (deleted) => {
          if (!deleted) {
            return;
          }

          this.feedbackStore.success('Coche eliminado correctamente.');
          this.reload();
        },
        error: (error: unknown) => {
          this.feedbackStore.error(getHttpErrorMessage(error, 'No se ha podido borrar el coche.'));
        },
      });
  }

  protected exportCurrentView(): void {
    if (this.exporting()) {
      return;
    }

    this.exporting.set(true);

    this.carsApi
      .exportCars(formValueToFilters(this.filtersForm.getRawValue()))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exporting.set(false)),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, 'cars.xlsx');
          this.feedbackStore.success('Excel exportado correctamente.');
        },
        error: (error: unknown) => {
          this.feedbackStore.error(
            getHttpErrorMessage(error, 'No se ha podido exportar el Excel.'),
          );
        },
      });
  }

  private loadCatalog(): void {
    this.catalogStore.loadCatalog().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private subscribeToCars(): void {
    merge(
      this.routeFormValueChanges(),
      this.refreshTrigger$.pipe(map(() => this.filtersForm.getRawValue())),
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((formValue) => this.fetchCars(formValue)),
      )
      .subscribe((response) => this.handleCarsResponse(response));
  }

  private routeFormValueChanges() {
    return this.route.queryParamMap.pipe(
      map((queryParamMap) => queryParamsToFormValue(queryParamMap)),
      tap((formValue) => this.applyFormValueFromUrl(formValue)),
    );
  }

  private fetchCars(formValue: CarsFilterFormValue) {
    this.loading.set(true);
    this.errorMessage.set(null);

    return this.carsApi.getCars(formValueToFilters(formValue)).pipe(
      catchError((error: unknown) => {
        this.carsResponse.set(null);
        this.errorMessage.set(getHttpErrorMessage(error, 'No se ha podido cargar el listado.'));
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private handleCarsResponse(response: CarsResponse | null): void {
    if (!response) {
      return;
    }

    this.carsResponse.set(response);
    this.paginationItems.set(
      buildPaginationItems(response.meta.currentPage, response.meta.totalPages),
    );
  }

  private applyFormValueFromUrl(formValue: CarsFilterFormValue): void {
    this.filtersForm.patchValue(formValue, { emitEvent: false });
    this.updateModels(formValue.brandId);
  }

  private subscribeToBrandChanges(): void {
    this.filtersForm.controls.brandId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((brandId) => this.handleBrandChange(brandId));
  }

  private handleBrandChange(brandId: string): void {
    this.updateModels(brandId);

    const currentModel = this.filtersForm.controls.modelId.value;
    const exists = this.catalogStore
      .getModelsForBrand(brandId)
      .some((model) => model.id === currentModel);

    if (!exists) {
      this.filtersForm.controls.modelId.setValue('', { emitEvent: false });
    }
  }

  private subscribeToFormChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(() => this.filtersForm.getRawValue()),
        startWith(this.filtersForm.getRawValue()),
        pairwise(),
        map(([previousValue, currentValue]) =>
          this.getQueryParamsForNavigation(previousValue, currentValue),
        ),
        filter(
          (queryParams): queryParams is Record<string, string | number | boolean> =>
            queryParams !== null,
        ),
        debounceTime(250),
        distinctUntilChanged(
          (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
        ),
      )
      .subscribe((queryParams) => this.navigateWithQueryParams(queryParams));
  }

  private getQueryParamsForNavigation(
    previousValue: CarsFilterFormValue,
    currentValue: CarsFilterFormValue,
  ): CarsListQueryParams | null {
    if (currentValue.page !== 1 && haveFiltersChanged(previousValue, currentValue)) {
      this.filtersForm.controls.page.setValue(1);
      return null;
    }

    return serializeFormValue(currentValue);
  }

  private navigateWithQueryParams(queryParams: CarsListQueryParams): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private updateModels(brandId: string): void {
    if (!brandId) {
      this.currentModels.set([]);
      return;
    }

    this.catalogStore
      .loadModelsByBrand(brandId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((models) => this.currentModels.set(models));
  }
}
