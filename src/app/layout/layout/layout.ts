import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { SessionTimeoutService } from '../../core/services/session-timeout';
import { HeaderComponent } from '../../shared/components/header/header';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = signal(false);

  constructor(
    private authService: AuthService,
    protected notificationService: NotificationService,
    private sessionTimeout: SessionTimeoutService
  ) {}

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe();
    this.sessionTimeout.start();
  }

  ngOnDestroy(): void {
    this.sessionTimeout.stop();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
