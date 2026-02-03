import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../appointments';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS
} from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-appointment-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentListComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly router = inject(Router);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'appointment_date',
    order: 'desc'
  });

  protected readonly filterStatus = signal<string>('');
  protected readonly filterType = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'appointment_number', label: 'Apt #', sortable: true },
    { key: 'appointment_date', label: 'Date', sortable: true },
    { key: 'start_time', label: 'Time', sortable: true },
    { key: 'patient', label: 'Patient', sortable: false },
    { key: 'doctor', label: 'Doctor', sortable: false },
    { key: 'appointment_type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  protected readonly statusOptions: { value: AppointmentStatus | ''; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  protected readonly typeOptions: { value: AppointmentType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'checkup', label: 'Checkup' }
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  protected loadAppointments(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.filterStatus()) params['status'] = this.filterStatus();
    if (this.filterType()) params['appointment_type'] = this.filterType();
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.appointmentsService.list(params).subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load appointments');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadAppointments();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadAppointments();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadAppointments();
  }

  protected createAppointment(): void {
    this.router.navigate(['/appointments/new']);
  }

  protected viewAppointment(appointment: Appointment): void {
    this.router.navigate(['/appointments', appointment.id]);
  }

  protected deleteAppointment(appointment: Appointment): void {
    if (confirm(`Are you sure you want to delete appointment ${appointment.appointment_number}?`)) {
      this.appointmentsService.delete(appointment.id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => {
          this.error.set('Failed to delete appointment');
          console.error(err);
        }
      });
    }
  }

  protected getStatusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABELS[status] || status;
  }

  protected getTypeLabel(type: AppointmentType): string {
    return APPOINTMENT_TYPE_LABELS[type] || type;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected formatTime(time: string): string {
    return time.substring(0, 5);
  }
}

