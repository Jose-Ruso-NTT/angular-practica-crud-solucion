import { Routes } from '@angular/router';
import { authenticatedGuard } from '@core/guards/authenticated-guard';
import { guestOnlyGuard } from '@core/guards/guest-only-guard';
import { AppShellComponent } from '@core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('@features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authenticatedGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'cars',
        loadChildren: () => import('@features/cars/cars.routes').then((m) => m.CARS_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
