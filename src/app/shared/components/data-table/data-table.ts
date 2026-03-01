import { Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  template?: string;
}

export interface TableAction {
  label: string;
  icon?: string;
  variant?: 'default' | 'danger';
  action: string;
}

export interface SortEvent {
  column: string;
  order: 'asc' | 'desc';
}

export interface PageEvent {
  page: number;
}

@Component({
  selector: 'app-data-table',
  imports: [],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTableComponent {
  columns = input<TableColumn[]>([]);
  data = input<Record<string, unknown>[]>([]);
  actions = input<TableAction[]>([]);
  loading = input(false);
  totalItems = input(0);
  currentPage = input(1);
  pageSize = input(10);
  sortColumn = input('');
  sortOrder = input<'asc' | 'desc'>('asc');

  sorted = output<SortEvent>();
  pageChanged = output<PageEvent>();
  actionClicked = output<{ action: string; item: Record<string, unknown> }>();

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize()) || 1;
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const order =
      this.sortColumn() === column.key && this.sortOrder() === 'asc'
        ? 'desc'
        : 'asc';

    this.sorted.emit({ column: column.key, order });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage()) return;
    this.pageChanged.emit({ page });
  }

  onAction(action: string, item: Record<string, unknown>): void {
    this.actionClicked.emit({ action, item });
  }

  getCellValue(item: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce((obj: unknown, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, item);
  }
}
