import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  TemplateRef,
  contentChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface SortState {
  column: string | null;
  order: 'asc' | 'desc' | null;
}

export interface PaginationState {
  page: number;
  size: number;
  total: number;
}

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T extends { id: string }> {
  // Inputs
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly pagination = input<PaginationState | null>(null);
  readonly sort = input<SortState>({ column: null, order: null });
  readonly emptyMessage = input('No data found');
  readonly emptyIcon = input('folder_open');

  // Content projection for custom cell templates
  readonly cellTemplate = contentChild<TemplateRef<{ $implicit: T; column: TableColumn }>>('cellTemplate');
  readonly actionsTemplate = contentChild<TemplateRef<{ $implicit: T }>>('actionsTemplate');

  // Outputs
  readonly sortChange = output<SortState>();
  readonly pageChange = output<number>();

  // Computed
  protected readonly totalPages = computed(() => {
    const pag = this.pagination();
    if (!pag) return 0;
    return Math.ceil(pag.total / pag.size);
  });

  protected readonly hasNextPage = computed(() => {
    const pag = this.pagination();
    if (!pag) return false;
    return pag.page < this.totalPages();
  });

  protected readonly hasPrevPage = computed(() => {
    const pag = this.pagination();
    if (!pag) return false;
    return pag.page > 1;
  });

  protected readonly showingFrom = computed(() => {
    const pag = this.pagination();
    if (!pag || pag.total === 0) return 0;
    return (pag.page - 1) * pag.size + 1;
  });

  protected readonly showingTo = computed(() => {
    const pag = this.pagination();
    if (!pag) return 0;
    return Math.min(pag.page * pag.size, pag.total);
  });

  protected readonly hasActions = computed(() => !!this.actionsTemplate());

  protected onHeaderClick(column: TableColumn): void {
    if (!column.sortable) return;

    const currentSort = this.sort();
    let newSort: SortState;

    if (currentSort.column === column.key) {
      // Cycle through: asc -> desc -> null
      if (currentSort.order === 'asc') {
        newSort = { column: column.key, order: 'desc' };
      } else if (currentSort.order === 'desc') {
        newSort = { column: null, order: null };
      } else {
        newSort = { column: column.key, order: 'asc' };
      }
    } else {
      newSort = { column: column.key, order: 'asc' };
    }

    this.sortChange.emit(newSort);
  }

  protected getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    const currentSort = this.sort();
    if (currentSort.column !== column.key) return 'unfold_more';
    return currentSort.order === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  protected isSorted(column: TableColumn): boolean {
    return this.sort().column === column.key;
  }

  protected prevPage(): void {
    const pag = this.pagination();
    if (pag && this.hasPrevPage()) {
      this.pageChange.emit(pag.page - 1);
    }
  }

  protected nextPage(): void {
    const pag = this.pagination();
    if (pag && this.hasNextPage()) {
      this.pageChange.emit(pag.page + 1);
    }
  }

  protected getCellValue(item: T, column: TableColumn): unknown {
    return (item as Record<string, unknown>)[column.key];
  }

  protected trackById(_index: number, item: T): string {
    return item.id;
  }

  protected trackByKey(_index: number, column: TableColumn): string {
    return column.key;
  }
}
