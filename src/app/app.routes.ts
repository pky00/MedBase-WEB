import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      // Patients
      {
        path: 'patients',
        loadComponent: () => import('./features/patients/patient-list/patient-list').then(m => m.PatientListComponent)
      },
      {
        path: 'patients/new',
        loadComponent: () => import('./features/patients/patient-form/patient-form').then(m => m.PatientFormComponent)
      },
      {
        path: 'patients/:id/edit',
        loadComponent: () => import('./features/patients/patient-form/patient-form').then(m => m.PatientFormComponent)
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./features/patients/patient-form/patient-form').then(m => m.PatientFormComponent)
      },
      // Doctors
      {
        path: 'doctors',
        loadComponent: () => import('./features/doctors/doctor-list/doctor-list').then(m => m.DoctorListComponent)
      },
      {
        path: 'doctors/new',
        loadComponent: () => import('./features/doctors/doctor-form/doctor-form').then(m => m.DoctorFormComponent)
      },
      {
        path: 'doctors/:id/edit',
        loadComponent: () => import('./features/doctors/doctor-form/doctor-form').then(m => m.DoctorFormComponent)
      },
      {
        path: 'doctors/:id',
        loadComponent: () => import('./features/doctors/doctor-form/doctor-form').then(m => m.DoctorFormComponent)
      },
      // Appointments
      {
        path: 'appointments',
        loadComponent: () => import('./features/appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent)
      },
      {
        path: 'appointments/new',
        loadComponent: () => import('./features/appointments/appointment-form/appointment-form').then(m => m.AppointmentFormComponent)
      },
      {
        path: 'appointments/:id/edit',
        loadComponent: () => import('./features/appointments/appointment-form/appointment-form').then(m => m.AppointmentFormComponent)
      },
      {
        path: 'appointments/:id',
        loadComponent: () => import('./features/appointments/appointment-form/appointment-form').then(m => m.AppointmentFormComponent)
      },
      // Prescriptions
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/prescriptions/prescription-list/prescription-list').then(m => m.PrescriptionListComponent)
      },
      {
        path: 'prescriptions/new',
        loadComponent: () => import('./features/prescriptions/prescription-form/prescription-form').then(m => m.PrescriptionFormComponent)
      },
      {
        path: 'prescriptions/:id/edit',
        loadComponent: () => import('./features/prescriptions/prescription-form/prescription-form').then(m => m.PrescriptionFormComponent)
      },
      {
        path: 'prescriptions/:id',
        loadComponent: () => import('./features/prescriptions/prescription-form/prescription-form').then(m => m.PrescriptionFormComponent)
      },
      // Medical Records
      {
        path: 'medical-records',
        loadComponent: () => import('./features/medical-records/medical-record-list/medical-record-list').then(m => m.MedicalRecordListComponent)
      },
      {
        path: 'medical-records/new',
        loadComponent: () => import('./features/medical-records/medical-record-form/medical-record-form').then(m => m.MedicalRecordFormComponent)
      },
      {
        path: 'medical-records/:id/edit',
        loadComponent: () => import('./features/medical-records/medical-record-form/medical-record-form').then(m => m.MedicalRecordFormComponent)
      },
      {
        path: 'medical-records/:id',
        loadComponent: () => import('./features/medical-records/medical-record-form/medical-record-form').then(m => m.MedicalRecordFormComponent)
      },
      // Medicines
      {
        path: 'medicines',
        loadComponent: () => import('./features/medicines/medicine-list/medicine-list').then(m => m.MedicineListComponent)
      },
      {
        path: 'medicines/new',
        loadComponent: () => import('./features/medicines/medicine-form/medicine-form').then(m => m.MedicineFormComponent)
      },
      {
        path: 'medicines/:id/edit',
        loadComponent: () => import('./features/medicines/medicine-form/medicine-form').then(m => m.MedicineFormComponent)
      },
      {
        path: 'medicines/:id',
        loadComponent: () => import('./features/medicines/medicine-form/medicine-form').then(m => m.MedicineFormComponent)
      },
      // Medical Devices
      {
        path: 'medical-devices',
        loadComponent: () => import('./features/medical-devices/medical-device-list/medical-device-list').then(m => m.MedicalDeviceListComponent)
      },
      {
        path: 'medical-devices/new',
        loadComponent: () => import('./features/medical-devices/medical-device-form/medical-device-form').then(m => m.MedicalDeviceFormComponent)
      },
      {
        path: 'medical-devices/:id/edit',
        loadComponent: () => import('./features/medical-devices/medical-device-form/medical-device-form').then(m => m.MedicalDeviceFormComponent)
      },
      {
        path: 'medical-devices/:id',
        loadComponent: () => import('./features/medical-devices/medical-device-form/medical-device-form').then(m => m.MedicalDeviceFormComponent)
      },
      // Equipment
      {
        path: 'equipment',
        loadComponent: () => import('./features/equipment/equipment-list/equipment-list').then(m => m.EquipmentListComponent)
      },
      {
        path: 'equipment/new',
        loadComponent: () => import('./features/equipment/equipment-form/equipment-form').then(m => m.EquipmentFormComponent)
      },
      {
        path: 'equipment/:id/edit',
        loadComponent: () => import('./features/equipment/equipment-form/equipment-form').then(m => m.EquipmentFormComponent)
      },
      {
        path: 'equipment/:id',
        loadComponent: () => import('./features/equipment/equipment-form/equipment-form').then(m => m.EquipmentFormComponent)
      },
      // Donors
      {
        path: 'donors',
        loadComponent: () => import('./features/donors/donor-list/donor-list').then(m => m.DonorListComponent)
      },
      {
        path: 'donors/new',
        loadComponent: () => import('./features/donors/donor-form/donor-form').then(m => m.DonorFormComponent)
      },
      {
        path: 'donors/:id/edit',
        loadComponent: () => import('./features/donors/donor-form/donor-form').then(m => m.DonorFormComponent)
      },
      {
        path: 'donors/:id',
        loadComponent: () => import('./features/donors/donor-form/donor-form').then(m => m.DonorFormComponent)
      },
      // Donations
      {
        path: 'donations',
        loadComponent: () => import('./features/donations/donation-list/donation-list').then(m => m.DonationListComponent)
      },
      {
        path: 'donations/new',
        loadComponent: () => import('./features/donations/donation-form/donation-form').then(m => m.DonationFormComponent)
      },
      {
        path: 'donations/:id/edit',
        loadComponent: () => import('./features/donations/donation-form/donation-form').then(m => m.DonationFormComponent)
      },
      {
        path: 'donations/:id',
        loadComponent: () => import('./features/donations/donation-form/donation-form').then(m => m.DonationFormComponent)
      },
      // Users
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
