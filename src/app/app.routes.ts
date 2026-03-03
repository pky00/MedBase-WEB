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
        path: 'third-parties',
        loadComponent: () =>
          import('./pages/third-parties/third-party-list/third-party-list').then(
            (m) => m.ThirdPartyListComponent
          ),
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
