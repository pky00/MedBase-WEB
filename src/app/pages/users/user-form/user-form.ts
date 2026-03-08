import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../../core/constants/app.constants';
import { QueryParams } from '../../../core/models/api.model';
import { ThirdParty } from '../../../core/models/third-party.model';
import { User, UserCreate, UserUpdate } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-user-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  // Third party linking (create only)
  thirdPartyOptions = signal<DropdownOption[]>([]);
  thirdPartyPage = 1;
  thirdPartyHasMore = signal(false);
  thirdPartyId: number | null = null;

  userId: number | null = null;
  username = '';
  name = '';
  email = '';
  password = '';
  role: 'admin' | 'user' = 'user';
  isActive = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.userId = Number(id);
      this.loadUser();
    } else {
      this.loadThirdParties();
    }
  }

  // Third party dropdown methods
  loadThirdParties(search?: string): void {
    const params: QueryParams = { page: this.thirdPartyPage, size: 50, exclude_users: true };
    if (search) params['search'] = search;

    this.api.getList<ThirdParty>(API.THIRD_PARTIES, params).subscribe({
      next: (response) => {
        const options = response.items.map((tp) => ({ value: tp.id, label: tp.name }));
        if (this.thirdPartyPage === 1) {
          this.thirdPartyOptions.set(options);
        } else {
          this.thirdPartyOptions.update((prev) => [...prev, ...options]);
        }
        this.thirdPartyHasMore.set(response.page < response.pages);
      },
    });
  }

  onThirdPartyLoadMore(): void {
    this.thirdPartyPage++;
    this.loadThirdParties();
  }

  onThirdPartySearch(search: string): void {
    this.thirdPartyPage = 1;
    this.loadThirdParties(search);
  }

  onThirdPartySelected(value: number | null): void {
    this.thirdPartyId = value;
    if (value) {
      this.api.get<ThirdParty>(`${API.THIRD_PARTIES}/${value}`).subscribe({
        next: (tp) => {
          this.name = tp.name || this.name;
          this.email = tp.email || this.email;
          this.cdr.markForCheck();
        },
      });
    }
  }

  loadUser(): void {
    this.loading.set(true);
    this.api.get<User>(`${API.USERS}/${this.userId}`).subscribe({
      next: (user) => {
        this.username = user.username;
        this.name = user.third_party?.name || '';
        this.email = user.third_party?.email || '';
        this.role = user.role;
        this.isActive = user.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load user.');
        this.router.navigate([ROUTES.USERS]);
      },
    });
  }

  onSubmit(): void {
    if (!this.username || (!this.isEdit() && !this.name)) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (!this.isEdit() && !this.password) {
      this.errorMessage.set('Password is required for new users.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: UserUpdate = {
        username: this.username,
        role: this.role,
        is_active: this.isActive,
      };
      if (this.password) {
        data.password = this.password;
      }

      this.api.put<User>(`${API.USERS}/${this.userId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('User updated successfully.');
          this.router.navigate([ROUTES.USERS, this.userId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update user.');
        },
      });
    } else {
      const data: UserCreate = {
        username: this.username,
        name: this.name,
        email: this.email || undefined,
        password: this.password,
        role: this.role,
        is_active: this.isActive,
        third_party_id: this.thirdPartyId || undefined,
      };

      this.api.post<User>(API.USERS, data).subscribe({
        next: (user) => {
          this.saving.set(false);
          this.notification.success('User created successfully.');
          this.router.navigate([ROUTES.USERS, user.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create user.');
        },
      });
    }
  }

  onRoleChange(event: Event): void {
    this.role = (event.target as HTMLSelectElement).value as 'admin' | 'user';
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.USERS]);
  }
}
