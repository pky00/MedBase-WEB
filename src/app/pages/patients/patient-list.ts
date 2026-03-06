import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Patient } from '../../core/models/patient.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-patient-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientListComponent implements OnInit {
  patients = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterActive = signal('');
  filterGender = signal('');
  searchQuery = '';

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'gender', label: 'Gender', sortable: true, format: this.formatGender },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true, format: formatActiveStatus },
  ];

  actions: TableAction[] = [
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
    this.loadPatients();
  }

  formatGender(value: unknown): string {
    const map: Record<string, string> = {
      male: 'Male',
      female: 'Female',
    };
    return map[value as string] || '—';
  }

  loadPatients(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterActive()) params['is_active'] = this.filterActive();
    if (this.filterGender()) params['gender'] = this.filterGender();
    if (this.searchQuery.trim()) params['search'] = this.searchQuery.trim();

    this.api.getList<Patient>(API.PATIENTS, params).subscribe({
      next: (response: PaginatedResponse<Patient>) => {
        this.patients.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load patients.');
      },
    });
  }

  onSearch(): void {
    this.table.currentPage.set(1);
    this.loadPatients();
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.PATIENTS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.PATIENTS, id, 'edit']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createPatient(): void {
    this.router.navigate([ROUTES.PATIENTS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.PATIENTS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Patient deleted successfully.');
        this.loadPatients();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete patient.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
