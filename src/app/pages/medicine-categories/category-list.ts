import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-medicine-category-list',
  imports: [DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryListComponent implements OnInit {
  categories = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();

  deleteModalOpen = signal(false);
  categoryToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
  ];

  actions: TableAction[] = [
    { label: 'Edit', action: 'edit' },
    { label: 'Delete', action: 'delete', variant: 'danger' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    this.api.getList<Category>(API.MEDICINE_CATEGORIES, params).subscribe({
      next: (response: PaginatedResponse<Category>) => {
        this.categories.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load medicine categories.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'edit':
        this.router.navigate([ROUTES.MEDICINE_CATEGORIES, id, 'edit']);
        break;
      case 'delete':
        this.categoryToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createCategory(): void {
    this.router.navigate([ROUTES.MEDICINE_CATEGORIES, 'new']);
  }

  confirmDelete(): void {
    const category = this.categoryToDelete();
    if (!category) return;

    this.deleting.set(true);
    this.api.delete(`${API.MEDICINE_CATEGORIES}/${category['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.categoryToDelete.set(null);
        this.notification.success('Medicine category deleted successfully.');
        this.loadCategories();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete category. It may have linked medicines.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.categoryToDelete.set(null);
  }
}
