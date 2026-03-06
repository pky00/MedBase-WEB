import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { AppointmentDetail, MedicalRecord, VitalSign } from '../../core/models/appointment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-appointment-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './appointment-view.html',
  styleUrl: './appointment-view.scss',
})
export class AppointmentViewComponent implements OnInit {
  appointment = signal<AppointmentDetail | null>(null);
  loading = signal(true);

  private appointmentId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentId = Number(id);
      this.loadAppointment();
    }
  }

  loadAppointment(): void {
    this.loading.set(true);
    this.api.get<AppointmentDetail>(`${API.APPOINTMENTS}/${this.appointmentId}`).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load appointment.');
        this.router.navigate([ROUTES.APPOINTMENTS]);
      },
    });
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  }

  formatType(type: string): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      walk_in: 'Walk-in',
    };
    return map[type] || type;
  }

  formatLocation(location: string): string {
    const map: Record<string, string> = {
      internal: 'Internal',
      external: 'External',
    };
    return map[location] || location;
  }

  editAppointment(): void {
    this.router.navigate([ROUTES.APPOINTMENTS, this.appointmentId, 'edit']);
  }

  processAppointment(): void {
    this.router.navigate([ROUTES.APPOINTMENTS, this.appointmentId, 'flow']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.APPOINTMENTS]);
  }
}
