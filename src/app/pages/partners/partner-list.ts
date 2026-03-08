import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Partner } from '../../core/models/partner.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-partner-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './partner-list.html',
  styleUrl: './partner-list.scss',
})
export class PartnerListComponent implements OnInit {
  partners = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterPartnerType = signal('');
  filterOrgType = signal('');
  filterActive = signal('');

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'third_party.name', label: 'Name', sortable: false },
    { key: 'partner_type', label: 'Partner Type', sortable: true, format: this.formatPartnerType },
    { key: 'organization_type', label: 'Organization Type', sortable: true, format: this.formatOrgType },
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
    this.loadPartners();
  }

  formatPartnerType(value: unknown): string {
    const map: Record<string, string> = {
      donor: 'Donor',
      referral: 'Referral',
      both: 'Both',
    };
    return map[value as string] || String(value || '—');
  }

  formatOrgType(value: unknown): string {
    const map: Record<string, string> = {
      NGO: 'NGO',
      organization: 'Organization',
      individual: 'Individual',
      hospital: 'Hospital',
      medical_center: 'Medical Center',
    };
    return map[value as string] || String(value || '—');
  }

  loadPartners(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterPartnerType()) params['partner_type'] = this.filterPartnerType();
    if (this.filterOrgType()) params['organization_type'] = this.filterOrgType();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<Partner>(API.PARTNERS, params).subscribe({
      next: (response: PaginatedResponse<Partner>) => {
        this.partners.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load partners.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.PARTNERS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.PARTNERS, id, 'edit']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createPartner(): void {
    this.router.navigate([ROUTES.PARTNERS, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.PARTNERS}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Partner deleted successfully.');
        this.loadPartners();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete partner.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
