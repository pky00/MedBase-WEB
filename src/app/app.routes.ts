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
        path: 'partners',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/partners/partner-list').then(
                (m) => m.PartnerListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/partners/partner-form').then(
                (m) => m.PartnerFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/partners/partner-view').then(
                (m) => m.PartnerViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/partners/partner-form').then(
                (m) => m.PartnerFormComponent
              ),
          },
        ],
      },
      {
        path: 'patients',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/patients/patient-list').then(
                (m) => m.PatientListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/patients/patient-form').then(
                (m) => m.PatientFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/patients/patient-view').then(
                (m) => m.PatientViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/patients/patient-form').then(
                (m) => m.PatientFormComponent
              ),
          },
        ],
      },
      {
        path: 'doctors',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/doctors/doctor-list').then(
                (m) => m.DoctorListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/doctors/doctor-form').then(
                (m) => m.DoctorFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/doctors/doctor-view').then(
                (m) => m.DoctorViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/doctors/doctor-form').then(
                (m) => m.DoctorFormComponent
              ),
          },
        ],
      },
      {
        path: 'appointments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/appointments/appointment-list').then(
                (m) => m.AppointmentListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/appointments/appointment-form').then(
                (m) => m.AppointmentFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/appointments/appointment-view').then(
                (m) => m.AppointmentViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/appointments/appointment-form').then(
                (m) => m.AppointmentFormComponent
              ),
          },
          {
            path: ':id/flow',
            loadComponent: () =>
              import('./pages/appointments/appointment-flow').then(
                (m) => m.AppointmentFlowComponent
              ),
          },
        ],
      },
      {
        path: 'third-parties',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/third-parties/third-party-list').then(
                (m) => m.ThirdPartyListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/third-parties/third-party-view').then(
                (m) => m.ThirdPartyViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/third-parties/third-party-form').then(
                (m) => m.ThirdPartyFormComponent
              ),
          },
        ],
      },
      {
        path: 'medical-records',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/medical-records/record-list').then(
                (m) => m.RecordListComponent
              ),
          },
        ],
      },
      {
        path: 'inventory-transactions',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/inventory-transactions/transaction-list').then(
                (m) => m.TransactionListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/inventory-transactions/transaction-form').then(
                (m) => m.TransactionFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/inventory-transactions/transaction-view').then(
                (m) => m.TransactionViewComponent
              ),
          },
        ],
      },
      {
        path: 'treatments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/treatments/treatment-list').then(
                (m) => m.TreatmentListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/treatments/treatment-form').then(
                (m) => m.TreatmentFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/treatments/treatment-view').then(
                (m) => m.TreatmentViewComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/treatments/treatment-form').then(
                (m) => m.TreatmentFormComponent
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
