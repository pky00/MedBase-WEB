import { Component, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ROUTES } from '../../../core/constants/app.constants';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const name = user.third_party?.name || user.username;
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

  changePassword(): void {
    this.menuOpen.set(false);
    this.router.navigate([ROUTES.CHANGE_PASSWORD]);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}
