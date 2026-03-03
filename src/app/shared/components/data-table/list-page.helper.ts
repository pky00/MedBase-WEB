import { signal } from '@angular/core';

import { SortEvent } from './data-table';

export class ListPageHelper {
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  sortColumn: ReturnType<typeof signal<string>>;
  sortOrder = signal<'asc' | 'desc'>('asc');

  constructor(
    public pageSize: number = 10,
    defaultSortColumn: string = 'id'
  ) {
    this.sortColumn = signal(defaultSortColumn);
  }

  onSort(event: SortEvent, reload: () => void): void {
    this.sortColumn.set(event.column);
    this.sortOrder.set(event.order);
    reload();
  }

  onPageChange(event: { page: number }, reload: () => void): void {
    this.currentPage.set(event.page);
    reload();
  }

  onFilterChange(filterSignal: ReturnType<typeof signal<string>>, event: Event, reload: () => void): void {
    filterSignal.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    reload();
  }
}
