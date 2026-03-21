import { Injectable, NgZone, OnDestroy } from '@angular/core';

import { AuthService } from './auth';
import { NotificationService } from './notification';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

@Injectable({
  providedIn: 'root',
})
export class SessionTimeoutService implements OnDestroy {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private boundResetTimer = this.resetTimer.bind(this);

  constructor(
    private authService: AuthService,
    private notification: NotificationService,
    private ngZone: NgZone
  ) {}

  start(): void {
    this.stop();
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach((event) =>
        document.addEventListener(event, this.boundResetTimer, { passive: true })
      );
      this.startTimer();
    });
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    ACTIVITY_EVENTS.forEach((event) =>
      document.removeEventListener(event, this.boundResetTimer)
    );
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.startTimer();
  }

  private startTimer(): void {
    this.timeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.notification.warning('Session expired due to inactivity.');
        this.authService.logout();
      });
    }, INACTIVITY_TIMEOUT_MS);
  }
}
