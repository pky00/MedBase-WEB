import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Appointment, AppointmentLocation, AppointmentStatus, AppointmentType } from '../../core/models/appointment.model';
import { Patient } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-appointment-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent, DropdownComponent],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
})
export class AppointmentListComponent implements OnInit {
  appointments = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper(10, 'appointment_date');

  filterStatus = signal('');
  filterType = signal('');
  filterLocation = signal('');
  filterPatientId = signal<number | null>(null);
  filterDoctorId = signal<number | null>(null);

  patientOptions = signal<DropdownOption[]>([]);
  patientPage = 1;
  patientHasMore = signal(false);

  doctorOptions = signal<DropdownOption[]>([]);
  doctorPage = 1;
  doctorHasMore = signal(false);

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'patient_name', label: 'Patient', sortable: true },
    { key: 'doctor_name', label: 'Doctor', sortable: true },
    { key: 'appointment_date', label: 'Date', sortable: true, format: this.formatDate },
    { key: 'status', label: 'Status', sortable: true, format: this.formatStatus },
    { key: 'type', label: 'Type', sortable: true, format: this.formatType },
    { key: 'location', label: 'Location', sortable: true, format: this.formatLocation },
  ];

  actions: TableAction[] = [
    { label: 'Process', action: 'process' },
    { label: 'View', action: 'view' },
    { label: 'Edit', action: 'edit' },
    { label: 'Delete', action: 'delete', variant: 'danger' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
  }

  formatDate(value: unknown): string {
    if (!value) return '—';
    return new Date(value as string).toLocaleString();
  }

  formatStatus(value: unknown): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return map[value as string] || (value as string) || '—';
  }

  formatType(value: unknown): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      walk_in: 'Walk-in',
    };
    return map[value as string] || (value as string) || '—';
  }

  formatLocation(value: unknown): string {
    const map: Record<string, string> = {
      internal: 'Internal',
      external: 'External',
    };
    return map[value as string] || (value as string) || '—';
  }

  loadAppointments(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterStatus()) params['status'] = this.filterStatus();
    if (this.filterType()) params['type'] = this.filterType();
    if (this.filterLocation()) params['location'] = this.filterLocation();
    if (this.filterPatientId()) params['patient_id'] = this.filterPatientId()!;
    if (this.filterDoctorId()) params['doctor_id'] = this.filterDoctorId()!;

    this.api.getList<Appointment>(API.APPOINTMENTS, params).subscribe({
      next: (response: PaginatedResponse<Appointment>) => {
        this.appointments.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load appointments.');
      },
    });
  }

  loadPatients(search?: string): void {
    const params: QueryParams = { page: this.patientPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Patient>(API.PATIENTS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => ({
          value: p.id,
          label: p.third_party?.name || `Patient #${p.id}`,
        }));
        if (this.patientPage === 1) {
          this.patientOptions.set(options);
        } else {
          this.patientOptions.update((prev) => [...prev, ...options]);
        }
        this.patientHasMore.set(response.page < response.pages);
      },
    });
  }

  loadDoctors(search?: string): void {
    const params: QueryParams = { page: this.doctorPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Doctor>(API.DOCTORS, params).subscribe({
      next: (response) => {
        const options = response.items.map((d) => ({ value: d.id, label: d.third_party?.name || `Doctor #${d.id}` }));
        if (this.doctorPage === 1) {
          this.doctorOptions.set(options);
        } else {
          this.doctorOptions.update((prev) => [...prev, ...options]);
        }
        this.doctorHasMore.set(response.page < response.pages);
      },
    });
  }

  onPatientLoadMore(): void {
    this.patientPage++;
    this.loadPatients();
  }

  onPatientSearch(search: string): void {
    this.patientPage = 1;
    this.loadPatients(search);
  }

  onDoctorLoadMore(): void {
    this.doctorPage++;
    this.loadDoctors();
  }

  onDoctorSearch(search: string): void {
    this.doctorPage = 1;
    this.loadDoctors(search);
  }

  onPatientFilterChange(value: unknown): void {
    this.filterPatientId.set(value as number | null);
    this.table.currentPage.set(1);
    this.loadAppointments();
  }

  onDoctorFilterChange(value: unknown): void {
    this.filterDoctorId.set(value as number | null);
    this.table.currentPage.set(1);
    this.loadAppointments();
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.APPOINTMENTS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.APPOINTMENTS, id, 'edit']);
        break;
      case 'process':
        this.router.navigate([ROUTES.APPOINTMENTS, id, 'flow']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createAppointment(): void {
    this.router.navigate([ROUTES.APPOINTMENTS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.APPOINTMENTS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Appointment deleted successfully.');
        this.loadAppointments();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete appointment.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
