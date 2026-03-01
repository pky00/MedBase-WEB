import { Component, OnInit, signal } from '@angular/core';

import { PaginatedResponse, QueryParams } from '../../../core/models/api.model';
import { ThirdParty } from '../../../core/models/third-party.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { DataTableComponent, SortEvent, TableColumn } from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-third-party-list',
  imports: [DataTableComponent],
  templateUrl: './third-party-list.html',
  styleUrl: './third-party-list.scss',
})
export class ThirdPartyListComponent implements OnInit {
  thirdParties = signal<Record<string, unknown>[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 10;
  sortColumn = signal('id');
  sortOrder = signal<'asc' | 'desc'>('asc');
  filterType = signal('');
  filterActive = signal('');

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  constructor(
    private api: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadThirdParties();
  }

  loadThirdParties(): void {
    this.loading.set(true);
    const params: QueryParams = {
      page: this.currentPage(),
      size: this.pageSize,
      sort: this.sortColumn(),
      order: this.sortOrder(),
    };

    if (this.filterType()) params['type'] = this.filterType();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<ThirdParty>('third-parties', params).subscribe({
      next: (response: PaginatedResponse<ThirdParty>) => {
        this.thirdParties.set(response.items as unknown as Record<string, unknown>[]);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load third parties.');
      },
    });
  }

  onSort(event: SortEvent): void {
    this.sortColumn.set(event.column);
    this.sortOrder.set(event.order);
    this.loadThirdParties();
  }

  onPageChange(event: { page: number }): void {
    this.currentPage.set(event.page);
    this.loadThirdParties();
  }

  onFilterType(event: Event): void {
    this.filterType.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadThirdParties();
  }

  onFilterActive(event: Event): void {
    this.filterActive.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadThirdParties();
  }
}
