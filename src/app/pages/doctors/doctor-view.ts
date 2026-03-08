import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Appointment } from '../../core/models/appointment.model';
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

  // Appointments
  appointments = signal<Appointment[]>([]);
  appointmentsLoading = signal(false);

  private doctorId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.doctorId = Number(id);
      this.loadDoctor(this.doctorId);
      this.loadAppointments();
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

  loadAppointments(): void {
    if (!this.doctorId) return;
    this.appointmentsLoading.set(true);
    const params: QueryParams = {
      page: 1,
      size: 100,
      doctor_id: this.doctorId,
      sort: 'appointment_date',
      order: 'desc',
    };
    this.api.getList<Appointment>(API.APPOINTMENTS, params).subscribe({
      next: (response: PaginatedResponse<Appointment>) => {
        this.appointments.set(response.items);
        this.appointmentsLoading.set(false);
      },
      error: () => {
        this.appointmentsLoading.set(false);
      },
    });
  }

  viewAppointment(id: number): void {
    this.router.navigate([ROUTES.APPOINTMENTS, id]);
  }

  formatDoctorType(type: string): string {
    const map: Record<string, string> = {
      internal: 'Internal',
      external: 'External',
      partner_provided: 'Partner Provided',
    };
    return map[type] || type;
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

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  editDoctor(): void {
    this.router.navigate([ROUTES.DOCTORS, this.doctor()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.DOCTORS]);
  }
}
