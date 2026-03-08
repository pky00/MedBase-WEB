import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { MedicalRecord } from '../../core/models/appointment.model';
import { Patient } from '../../core/models/patient.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-record-list',
  imports: [FormsModule, DataTableComponent, DropdownComponent],
  templateUrl: './record-list.html',
  styleUrl: './record-list.scss',
})
export class RecordListComponent implements OnInit {
  records = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper(10, 'id');

  filterPatientId = signal<number | null>(null);

  patientOptions = signal<DropdownOption[]>([]);
  patientPage = 1;
  patientHasMore = signal(false);

  columns: TableColumn[] = [
    { key: 'patient_name', label: 'Patient', sortable: true },
    { key: 'chief_complaint', label: 'Chief Complaint', sortable: false, format: this.truncateText },
    { key: 'diagnosis', label: 'Diagnosis', sortable: false, format: this.truncateText },
    { key: 'follow_up_date', label: 'Follow-up', sortable: true, format: this.formatDate },
    { key: 'created_at', label: 'Created', sortable: true, format: this.formatDateTime },
  ];

  actions: TableAction[] = [
    { label: 'View', action: 'view' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRecords();
    this.loadPatients();
  }

  truncateText(value: unknown): string {
    const text = value as string;
    if (!text) return '—';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  formatDate(value: unknown): string {
    if (!value) return '—';
    return new Date(value as string).toLocaleDateString();
  }

  formatDateTime(value: unknown): string {
    if (!value) return '—';
    return new Date(value as string).toLocaleString();
  }

  loadRecords(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterPatientId()) params['patient_id'] = this.filterPatientId()!;

    this.api.getList<MedicalRecord>(API.MEDICAL_RECORDS, params).subscribe({
      next: (response: PaginatedResponse<MedicalRecord>) => {
        this.records.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load medical records.');
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

  onPatientLoadMore(): void { this.patientPage++; this.loadPatients(); }
  onPatientSearch(search: string): void { this.patientPage = 1; this.loadPatients(search); }

  onPatientFilterChange(value: unknown): void {
    this.filterPatientId.set(value as number | null);
    this.table.currentPage.set(1);
    this.loadRecords();
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const appointmentId = event.item['appointment_id'];
    if (event.action === 'view' && appointmentId) {
      this.router.navigate([ROUTES.APPOINTMENTS, appointmentId]);
    }
  }
}
