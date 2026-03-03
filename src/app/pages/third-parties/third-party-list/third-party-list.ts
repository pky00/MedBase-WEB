import { Component, OnInit, signal } from '@angular/core';

import { API, formatActiveStatus } from '../../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../../core/models/api.model';
import { ThirdParty } from '../../../core/models/third-party.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../../shared/components/data-table/list-page.helper';

@Component({
  selector: 'app-third-party-list',
  imports: [DataTableComponent],
  templateUrl: './third-party-list.html',
  styleUrl: './third-party-list.scss',
})
export class ThirdPartyListComponent implements OnInit {
  thirdParties = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterType = signal('');
  filterActive = signal('');

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true, format: formatActiveStatus },
  ];

  constructor(
    private api: ApiService,
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

    if (this.filterType()) params['type'] = this.filterType();
    if (this.filterActive()) params['is_active'] = this.filterActive();

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

}
