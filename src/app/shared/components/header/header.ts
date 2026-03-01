import { Component, output, signal } from '@angular/core';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  toggleSidebar = output<void>();

  menuOpen = signal(false);

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const name = user.name || user.username;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}
