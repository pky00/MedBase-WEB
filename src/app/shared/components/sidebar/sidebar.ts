import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
          { label: 'Dashboard', route: '/dashboard', icon: '📊' },
        ],
      },
      {
        title: 'Management',
        items: [
          { label: 'Third Parties', route: '/third-parties', icon: '🏢' },
        ],
      },
    ];

    if (this.authService.isAdmin()) {
      groups[0].items.push(
        { label: 'Users', route: '/users', icon: '👥' }
      );
    }

    return groups;
  }

  onNavClick(): void {
    this.closeSidebar.emit();
  }
}
