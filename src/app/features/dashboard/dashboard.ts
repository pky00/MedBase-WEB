import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  actions: { label: string; route: string }[];
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly cards: DashboardCard[] = [
    {
      title: 'Patients',
      description: 'Manage patient records, allergies, and medical history',
      icon: 'people',
      route: '/patients',
      color: 'blue',
      actions: [
        { label: 'View All', route: '/patients' },
        { label: 'Add New', route: '/patients/new' }
      ]
    },
    {
      title: 'Appointments',
      description: 'Schedule and manage patient appointments',
      icon: 'calendar_today',
      route: '/appointments',
      color: 'green',
      actions: [
        { label: "Today's Schedule", route: '/appointments' },
        { label: 'New Appointment', route: '/appointments/new' }
      ]
    },
    {
      title: 'Prescriptions',
      description: 'Create and dispense medicine prescriptions',
      icon: 'medication',
      route: '/prescriptions',
      color: 'orange',
      actions: [
        { label: 'Pending', route: '/prescriptions' },
        { label: 'New Prescription', route: '/prescriptions/new' }
      ]
    },
    {
      title: 'Doctors',
      description: 'Manage clinic doctors and their information',
      icon: 'medical_services',
      route: '/doctors',
      color: 'purple',
      actions: [
        { label: 'View All', route: '/doctors' },
        { label: 'Add Doctor', route: '/doctors/new' }
      ]
    },
    {
      title: 'Inventory',
      description: 'Track medicines, devices, and equipment stock',
      icon: 'inventory_2',
      route: '/medicines',
      color: 'red',
      actions: [
        { label: 'Medicines', route: '/medicines' },
        { label: 'Devices', route: '/medical-devices' },
        { label: 'Equipment', route: '/equipment' }
      ]
    },
    {
      title: 'Donations',
      description: 'Record and track donations from donors',
      icon: 'volunteer_activism',
      route: '/donations',
      color: 'teal',
      actions: [
        { label: 'Donors', route: '/donors' },
        { label: 'Record Donation', route: '/donations/new' }
      ]
    }
  ];

  protected navigate(route: string): void {
    this.router.navigate([route]);
  }

  protected getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  protected getUserFirstName(): string {
    const user = this.currentUser();
    return user?.first_name || user?.username || 'User';
  }
}
