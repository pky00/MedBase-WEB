import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Treatment } from '../../core/models/treatment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-treatment-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent, DropdownComponent],
  templateUrl: './treatment-list.html',
  styleUrl: './treatment-list.scss',
})
export class TreatmentListComponent implements OnInit {
  treatments = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper(10, 'treatment_date');
  filterStatus = signal('');

  // Patient filter dropdown
  patientOptions = signal<DropdownOption[]>([]);
  patientPage = 1;
  patientHasMore = signal(false);
  filterPatientId: number | null = null;

  // Partner filter dropdown
  partnerOptions = signal<DropdownOption[]>([]);
  partnerPage = 1;
  partnerHasMore = signal(false);
  filterPartnerId: number | null = null;

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'patient_name', label: 'Patient', sortable: false },
    { key: 'partner_name', label: 'Partner', sortable: false },
    { key: 'treatment_type', label: 'Type', sortable: true },
    { key: 'treatment_date', label: 'Date', sortable: true, format: this.formatDate },
    { key: 'status', label: 'Status', sortable: true, format: this.formatStatus },
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
    this.table.sortOrder.set('desc');
    this.loadTreatments();
    this.loadPatients();
    this.loadPartners();
  }

  formatDate(value: unknown): string {
    if (!value) return '—';
    return new Date(value as string).toLocaleDateString();
  }

  formatStatus(value: unknown): string {
    const map: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return map[value as string] || String(value || '—');
  }

  // Patient dropdown
  loadPatients(search?: string): void {
    const params: QueryParams = { page: this.patientPage, size: 50 };
    if (search) params['search'] = search;
    this.api.getList<Record<string, unknown>>(API.PATIENTS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => {
          const name = (p['third_party'] as Record<string, unknown>)?.['name'] || 'Unknown';
          return { value: p['id'] as number, label: String(name) };
        });
        if (this.patientPage === 1) {
          this.patientOptions.set(options);
        } else {
          this.patientOptions.update((prev) => [...prev, ...options]);
        }
        this.patientHasMore.set(response.page * response.size < response.total);
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

  onPatientSelected(): void {
    this.table.currentPage.set(1);
    this.loadTreatments();
  }

  // Partner dropdown
  loadPartners(search?: string): void {
    const params: QueryParams = { page: this.partnerPage, size: 50, partner_type: 'referral' };
    if (search) params['search'] = search;
    this.api.getList<Record<string, unknown>>(API.PARTNERS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => {
          const name = (p['third_party'] as Record<string, unknown>)?.['name'] || 'Unknown';
          return { value: p['id'] as number, label: String(name) };
        });
        if (this.partnerPage === 1) {
          this.partnerOptions.set(options);
        } else {
          this.partnerOptions.update((prev) => [...prev, ...options]);
        }
        this.partnerHasMore.set(response.page * response.size < response.total);
      },
    });
  }

  onPartnerLoadMore(): void {
    this.partnerPage++;
    this.loadPartners();
  }

  onPartnerSearch(search: string): void {
    this.partnerPage = 1;
    this.loadPartners(search);
  }

  onPartnerSelected(): void {
    this.table.currentPage.set(1);
    this.loadTreatments();
  }

  loadTreatments(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterPatientId) params['patient_id'] = this.filterPatientId;
    if (this.filterPartnerId) params['partner_id'] = this.filterPartnerId;
    if (this.filterStatus()) params['status'] = this.filterStatus();

    this.api.getList<Treatment>(API.TREATMENTS, params).subscribe({
      next: (response: PaginatedResponse<Treatment>) => {
        this.treatments.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load treatments.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.TREATMENTS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.TREATMENTS, id, 'edit']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createTreatment(): void {
    this.router.navigate([ROUTES.TREATMENTS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.TREATMENTS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Treatment deleted successfully.');
        this.loadTreatments();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete treatment.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
