import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { PaginatedResponse, QueryParams } from '../../../core/models/api.model';
import { User } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DataTableComponent, SortEvent, TableAction, TableColumn } from '../../../shared/components/data-table/data-table';
import { ModalComponent } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-user-list',
  imports: [DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  users = signal<Record<string, unknown>[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 10;
  sortColumn = signal('id');
  sortOrder = signal<'asc' | 'desc'>('asc');
  filterRole = signal('');
  filterActive = signal('');

  deleteModalOpen = signal(false);
  userToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
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
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const params: QueryParams = {
      page: this.currentPage(),
      size: this.pageSize,
      sort: this.sortColumn(),
      order: this.sortOrder(),
    };

    if (this.filterRole()) params['role'] = this.filterRole();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<User>('users', params).subscribe({
      next: (response: PaginatedResponse<User>) => {
        this.users.set(response.items as unknown as Record<string, unknown>[]);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load users.');
      },
    });
  }

  onSort(event: SortEvent): void {
    this.sortColumn.set(event.column);
    this.sortOrder.set(event.order);
    this.loadUsers();
  }

  onPageChange(event: { page: number }): void {
    this.currentPage.set(event.page);
    this.loadUsers();
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate(['/users', id]);
        break;
      case 'edit':
        this.router.navigate(['/users', id, 'edit']);
        break;
      case 'delete':
        this.userToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  onFilterRole(event: Event): void {
    this.filterRole.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterActive(event: Event): void {
    this.filterActive.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  createUser(): void {
    this.router.navigate(['/users/new']);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.deleting.set(true);
    this.api.delete(`users/${user['id']}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.userToDelete.set(null);
        this.notification.success('User deleted successfully.');
        this.loadUsers();
      },
      error: () => {
        this.deleting.set(false);
        this.notification.error('Failed to delete user.');
      },
    });
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.userToDelete.set(null);
  }
}
