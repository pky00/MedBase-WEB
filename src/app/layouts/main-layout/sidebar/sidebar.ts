import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  protected readonly navGroups: NavGroup[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' }
      ]
    },
    {
      title: 'Patients',
      items: [
        { label: 'All Patients', icon: 'people', route: '/patients' }
      ]
    },
    {
      title: 'Clinical',
      items: [
        { label: 'Doctors', icon: 'medical_services', route: '/doctors' },
        { label: 'Appointments', icon: 'calendar_today', route: '/appointments' },
        { label: 'Prescriptions', icon: 'medication', route: '/prescriptions' },
        { label: 'Medical Records', icon: 'description', route: '/medical-records' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { label: 'Medicines', icon: 'vaccines', route: '/medicines' },
        { label: 'Medical Devices', icon: 'accessibility', route: '/medical-devices' },
        { label: 'Equipment', icon: 'build', route: '/equipment' }
      ]
    },
    {
      title: 'Donations',
      items: [
        { label: 'Donors', icon: 'volunteer_activism', route: '/donors' },
        { label: 'Donations', icon: 'redeem', route: '/donations' }
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Users', icon: 'admin_panel_settings', route: '/users' }
      ]
    }
  ];
}

