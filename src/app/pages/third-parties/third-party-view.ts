import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { ThirdParty } from '../../core/models/third-party.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-third-party-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './third-party-view.html',
  styleUrl: './third-party-view.scss',
})
export class ThirdPartyViewComponent implements OnInit {
  thirdParty = signal<ThirdParty | null>(null);
  loading = signal(true);

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadThirdParty(Number(id));
    }
  }

  loadThirdParty(id: number): void {
    this.loading.set(true);
    this.api.get<ThirdParty>(`${API.THIRD_PARTIES}/${id}`).subscribe({
      next: (tp) => {
        this.thirdParty.set(tp);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load third party.');
        this.router.navigate([ROUTES.THIRD_PARTIES]);
      },
    });
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  editThirdParty(): void {
    this.router.navigate([ROUTES.THIRD_PARTIES, this.thirdParty()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.THIRD_PARTIES]);
  }
}
