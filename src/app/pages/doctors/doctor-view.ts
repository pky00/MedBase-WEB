import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { DoctorDetail } from '../../core/models/doctor.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-doctor-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './doctor-view.html',
  styleUrl: './doctor-view.scss',
})
export class DoctorViewComponent implements OnInit {
  doctor = signal<DoctorDetail | null>(null);
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
      this.loadDoctor(Number(id));
    }
  }

  loadDoctor(id: number): void {
    this.loading.set(true);
    this.api.get<DoctorDetail>(`${API.DOCTORS}/${id}`).subscribe({
      next: (doctor) => {
        this.doctor.set(doctor);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load doctor.');
        this.router.navigate([ROUTES.DOCTORS]);
      },
    });
  }

  formatDoctorType(type: string): string {
    const map: Record<string, string> = {
      internal: 'Internal',
      external: 'External',
      partner_provided: 'Partner Provided',
    };
    return map[type] || type;
  }

  editDoctor(): void {
    this.router.navigate([ROUTES.DOCTORS, this.doctor()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.DOCTORS]);
  }
}
