import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Treatment } from '../../core/models/treatment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-treatment-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './treatment-view.html',
  styleUrl: './treatment-view.scss',
})
export class TreatmentViewComponent implements OnInit {
  treatment = signal<Treatment | null>(null);
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
      this.loadTreatment(Number(id));
    }
  }

  loadTreatment(id: number): void {
    this.loading.set(true);
    this.api.get<Treatment>(`${API.TREATMENTS}/${id}`).subscribe({
      next: (treatment) => {
        this.treatment.set(treatment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load treatment.');
        this.router.navigate([ROUTES.TREATMENTS]);
      },
    });
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  formatCost(cost: string | null): string {
    if (!cost) return '—';
    return `$${Number(cost).toFixed(2)}`;
  }

  editTreatment(): void {
    this.router.navigate([ROUTES.TREATMENTS, this.treatment()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.TREATMENTS]);
  }
}
