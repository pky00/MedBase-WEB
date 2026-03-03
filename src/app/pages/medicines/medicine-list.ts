import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { Medicine } from '../../core/models/medicine.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/components/data-table/data-table';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { ListPageHelper } from '../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-medicine-list',
  imports: [FormsModule, DataTableComponent, ButtonComponent, ModalComponent, DropdownComponent],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.scss',
})
export class MedicineListComponent implements OnInit {
  medicines = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterCategory = signal('');
  filterActive = signal('');

  categoryOptions = signal<DropdownOption[]>([]);
  categoryPage = 1;
  categoryHasMore = signal(false);

  deleteModalOpen = signal(false);
  itemToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category_name', label: 'Category', sortable: false },
    { key: 'quantity', label: 'Quantity', sortable: true },
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
    this.loadCategories();
    this.loadMedicines();
  }

  loadCategories(search?: string): void {
    const params: QueryParams = { page: this.categoryPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Category>(API.MEDICINE_CATEGORIES, params).subscribe({
      next: (response) => {
        const options = response.items.map((c) => ({ value: c.id, label: c.name }));
        if (this.categoryPage === 1) {
          this.categoryOptions.set(options);
        } else {
          this.categoryOptions.update((prev) => [...prev, ...options]);
        }
        this.categoryHasMore.set(response.page < response.pages);
      },
    });
  }

  onCategoryLoadMore(): void {
    this.categoryPage++;
    this.loadCategories();
  }

  onCategorySearch(search: string): void {
    this.categoryPage = 1;
    this.loadCategories(search);
  }

  onCategoryChange(value: unknown): void {
    this.filterCategory.set(value ? String(value) : '');
    this.table.currentPage.set(1);
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterCategory()) params['category_id'] = this.filterCategory();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<Medicine>(API.MEDICINES, params).subscribe({
      next: (response: PaginatedResponse<Medicine>) => {
        this.medicines.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load medicines.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.MEDICINES, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.MEDICINES, id, 'edit']);
        break;
      case 'delete':
        this.itemToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createMedicine(): void {
    this.router.navigate([ROUTES.MEDICINES, 'new']);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.api.delete(`${API.MEDICINES}/${item['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.notification.success('Medicine deleted successfully.');
        this.loadMedicines();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete medicine. Inventory quantity must be 0.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
