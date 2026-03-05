import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Partner } from '../../core/models/partner.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-partner-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './partner-view.html',
  styleUrl: './partner-view.scss',
})
export class PartnerViewComponent implements OnInit {
  partner = signal<Partner | null>(null);
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
      this.loadPartner(Number(id));
    }
  }

  loadPartner(id: number): void {
    this.loading.set(true);
    this.api.get<Partner>(`${API.PARTNERS}/${id}`).subscribe({
      next: (partner) => {
        this.partner.set(partner);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load partner.');
        this.router.navigate([ROUTES.PARTNERS]);
      },
    });
  }

  formatPartnerType(type: string): string {
    const map: Record<string, string> = {
      donor: 'Donor',
      referral: 'Referral',
      both: 'Both',
    };
    return map[type] || type;
  }

  formatOrgType(type: string | null): string {
    if (!type) return '—';
    const map: Record<string, string> = {
      NGO: 'NGO',
      organization: 'Organization',
      individual: 'Individual',
      hospital: 'Hospital',
      medical_center: 'Medical Center',
    };
    return map[type] || type;
  }

  editPartner(): void {
    this.router.navigate([ROUTES.PARTNERS, this.partner()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.PARTNERS]);
  }
}
