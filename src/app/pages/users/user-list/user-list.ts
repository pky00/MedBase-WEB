import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { API, ROUTES, formatActiveStatus } from '../../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../../core/models/api.model';
import { User } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DataTableComponent, TableAction, TableColumn } from '../../../shared/components/data-table/data-table';
import { ListPageHelper } from '../../../shared/components/data-table/list-page.helper';
import { ModalComponent } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-user-list',
  imports: [DataTableComponent, ButtonComponent, ModalComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  users = signal<Record<string, unknown>[]>([]);
  table = new ListPageHelper();
  filterRole = signal('');
  filterActive = signal('');

  deleteModalOpen = signal(false);
  userToDelete = signal<Record<string, unknown> | null>(null);
  deleting = signal(false);

  columns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'third_party.name', label: 'Name', sortable: false },
    { key: 'third_party.email', label: 'Email', sortable: false },
    { key: 'role', label: 'Role', sortable: true },
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
    this.loadUsers();
  }

  loadUsers(): void {
    this.table.loading.set(true);
    const params: QueryParams = {
      page: this.table.currentPage(),
      size: this.table.pageSize,
      sort: this.table.sortColumn(),
      order: this.table.sortOrder(),
    };

    if (this.filterRole()) params['role'] = this.filterRole();
    if (this.filterActive()) params['is_active'] = this.filterActive();

    this.api.getList<User>(API.USERS, params).subscribe({
      next: (response: PaginatedResponse<User>) => {
        this.users.set(response.items as unknown as Record<string, unknown>[]);
        this.table.totalItems.set(response.total);
        this.table.loading.set(false);
      },
      error: () => {
        this.table.loading.set(false);
        this.notification.error('Failed to load users.');
      },
    });
  }

  onAction(event: { action: string; item: Record<string, unknown> }): void {
    const id = event.item['id'];
    switch (event.action) {
      case 'view':
        this.router.navigate([ROUTES.USERS, id]);
        break;
      case 'edit':
        this.router.navigate([ROUTES.USERS, id, 'edit']);
        break;
      case 'delete':
        this.userToDelete.set(event.item);
        this.deleteModalOpen.set(true);
        break;
    }
  }

  createUser(): void {
    this.router.navigate([ROUTES.USERS_NEW]);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.deleting.set(true);
    this.api.delete(`${API.USERS}/${user['id']}`).subscribe({
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
