import { Routes } from '@angular/router';
import { adminOnlyMatchGuard } from '@core/guards/admin-only-match-guard';

export const CARS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/cars/pages/car-list-page/cars-list.page').then((m) => m.CarsListPage),
  },
  {
    path: 'new',
    canMatch: [adminOnlyMatchGuard],
    loadComponent: () =>
      import('@features/cars/pages/car-form-page/car-form.page').then((m) => m.CarFormPage),
    data: { mode: 'create' },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@features/cars/pages/cars-access-denied-page/cars-access-denied.page').then(
        (m) => m.CarsAccessDeniedPage,
      ),
  },
  {
    path: ':id/edit',
    canMatch: [adminOnlyMatchGuard],
    loadComponent: () =>
      import('@features/cars/pages/car-form-page/car-form.page').then((m) => m.CarFormPage),
    data: { mode: 'edit' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('@features/cars/pages/cars-access-denied-page/cars-access-denied.page').then(
        (m) => m.CarsAccessDeniedPage,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@features/cars/pages/car-detail-page/car-detail.page').then((m) => m.CarDetailPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('@features/cars/pages/car-detail-page/car-detail-overview.page').then(
            (m) => m.CarDetailOverviewPage,
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('@features/cars/pages/car-detail-page/car-detail-documents.page').then(
            (m) => m.CarDetailDocumentsPage,
          ),
      },
    ],
  },
];
