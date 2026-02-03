import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService, UserListResponse } from '../users';
import { User } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-user-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'username',
    order: 'asc'
  });

  protected readonly search = signal('');
  protected readonly filterStatus = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.search()) params['search'] = this.search();
    if (this.filterStatus() !== '') params['is_active'] = this.filterStatus() === 'active';
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.usersService.list(params).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadUsers();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  protected createUser(): void {
    this.router.navigate(['/users/new']);
  }

  protected viewUser(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  protected deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.usersService.delete(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => {
          this.error.set('Failed to delete user');
          console.error(err);
        }
      });
    }
  }
}

