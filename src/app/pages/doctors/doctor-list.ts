import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Doctor } from '../../core/models/doctor.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-doctor-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.scss',
})
export class DoctorListComponent implements OnInit {
  doctors = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterType = signal('');
  filterActive = signal('');

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'specialization', label: 'Specialization', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: this.formatDoctorType },
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
    this.loadDoctors();
  }

  formatDoctorType(value: unknown): string {
    const map: Record<string, string> = {
      internal: 'Internal',
      external: 'External',
      partner_provided: 'Partner Provided',
    };
    return map[value as string] || String(value || '—');
  }

  loadDoctors(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterType()) params['type'] = this.filterType();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<Doctor>(API.DOCTORS, params).subscribe({
      next: (response: PaginatedResponse<Doctor>) => {
        this.doctors.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load doctors.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.DOCTORS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.DOCTORS, id, 'edit']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createDoctor(): void {
    this.router.navigate([ROUTES.DOCTORS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.DOCTORS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Doctor deleted successfully.');
        this.loadDoctors();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete doctor.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
