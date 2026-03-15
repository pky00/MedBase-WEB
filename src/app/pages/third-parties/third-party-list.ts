import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { ThirdParty } from '../../core/models/third-party.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';

@Component({
  selector: 'app-third-party-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './third-party-list.html',
  styleUrl: './third-party-list.scss',
})
export class ThirdPartyListComponent implements OnInit {
  thirdParties = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterActive = signal('');
  searchQuery = '';

  columns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true, format: formatActiveStatus },
  ];

  actions: TableAction[] = [
    { label: 'View', action: 'view' },
    { label: 'Edit', action: 'edit' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadThirdParties();
  }

  loadThirdParties(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterActive()) params['is_active'] = this.filterActive();
    if (this.searchQuery.trim()) params['search'] = this.searchQuery.trim();

    this.api.getList<ThirdParty>(API.THIRD_PARTIES, params).subscribe({
      next: (response: PaginatedResponse<ThirdParty>) => {
        this.thirdParties.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load third parties.');
      },
    });
  }

  onSearch(): void {
    this.table.currentPage.set(1);
    this.loadThirdParties();
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.THIRD_PARTIES, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.THIRD_PARTIES, id, 'edit']);
        break;
    }
  }
}
