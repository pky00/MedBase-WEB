import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/users/user-list/user-list').then((m) => m.UserListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/users/user-form/user-form').then((m) => m.UserFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/users/user-view/user-view').then((m) => m.UserViewComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/users/user-form/user-form').then((m) => m.UserFormComponent),
          },
        ],
      },
      {
        path: 'medicine-categories',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/medicine-categories/category-list').then(
                (m) => m.CategoryListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/medicine-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/medicine-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
        ],
      },
      {
        path: 'equipment-categories',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/equipment-categories/category-list').then(
                (m) => m.CategoryListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/equipment-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/equipment-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
        ],
      },
      {
        path: 'medical-device-categories',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/medical-device-categories/category-list').then(
                (m) => m.CategoryListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/medical-device-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/medical-device-categories/category-form').then(
                (m) => m.CategoryFormComponent
              ),
          },
        ],
      },
      {
        path: 'medicines',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/medicines/medicine-list').then(
                (m) => m.MedicineListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/medicines/medicine-form').then(
                (m) => m.MedicineFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/medicines/medicine-view').then(
                (m) => m.MedicineViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/medicines/medicine-form').then(
                (m) => m.MedicineFormComponent
              ),
          },
        ],
      },
      {
        path: 'equipment',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/equipment/equipment-list').then(
                (m) => m.EquipmentListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/equipment/equipment-form').then(
                (m) => m.EquipmentFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/equipment/equipment-view').then(
                (m) => m.EquipmentViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/equipment/equipment-form').then(
                (m) => m.EquipmentFormComponent
              ),
          },
        ],
      },
      {
        path: 'medical-devices',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/medical-devices/device-list').then(
                (m) => m.DeviceListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/medical-devices/device-form').then(
                (m) => m.DeviceFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/medical-devices/device-view').then(
                (m) => m.DeviceViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/medical-devices/device-form').then(
                (m) => m.DeviceFormComponent
              ),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
