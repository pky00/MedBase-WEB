import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly showUserMenu = signal(false);

  protected toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  protected closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }

  protected getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || user.username[0].toUpperCase();
  }

  protected getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'User';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  }
}
