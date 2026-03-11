import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ROUTES } from '../../../core/constants/app.constants';
import { AuthService } from '../../../core/services/auth';

interface NavItem {
  label: string;
  route: string;
  icon: string;
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
})
export class SidebarComponent {
  isCollapsed = input(false);
  closeSidebar = output<void>();

  constructor(private authService: AuthService) {}

  get navGroups(): NavGroup[] {
    const groups: NavGroup[] = [
      {
        title: 'General',
        items: [
          { label: 'Dashboard', route: ROUTES.DASHBOARD, icon: '📊' },
        ],
      },
      {
        title: 'Inventory',
        items: [
          { label: 'Medicines', route: ROUTES.MEDICINES, icon: '💊' },
          { label: 'Equipment', route: ROUTES.EQUIPMENT, icon: '🔧' },
          { label: 'Medical Devices', route: ROUTES.MEDICAL_DEVICES, icon: '🩺' },
          { label: 'Transactions', route: ROUTES.INVENTORY_TRANSACTIONS, icon: '📦' },
        ],
      },
      {
        title: 'Clinic',
        items: [
          { label: 'Appointments', route: ROUTES.APPOINTMENTS, icon: '📅' },
          { label: 'Treatments', route: ROUTES.TREATMENTS, icon: '🏥' },
        ],
      },
      {
        title: 'People',
        items: [
          { label: 'Patients', route: ROUTES.PATIENTS, icon: '🧑' },
          { label: 'Partners', route: ROUTES.PARTNERS, icon: '🤝' },
          { label: 'Doctors', route: ROUTES.DOCTORS, icon: '👨‍⚕️' },
          { label: 'Third Parties', route: ROUTES.THIRD_PARTIES, icon: '👤' },
        ],
      },
      {
        title: 'Categories',
        items: [
          { label: 'Medicine Cat.', route: ROUTES.MEDICINE_CATEGORIES, icon: '📋' },
          { label: 'Equipment Cat.', route: ROUTES.EQUIPMENT_CATEGORIES, icon: '📋' },
          { label: 'Device Cat.', route: ROUTES.MEDICAL_DEVICE_CATEGORIES, icon: '📋' },
        ],
      },
    ];

    if (this.authService.isAdmin()) {
      groups[0].items.push(
        { label: 'Users', route: ROUTES.USERS, icon: '👥' }
      );
    }

    return groups;
  }

  onNavClick(): void {
    this.closeSidebar.emit();
  }
}
