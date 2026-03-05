import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Category, CategoryCreate, CategoryUpdate } from '../../core/models/category.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-medicine-category-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  categoryId: number | null = null;
  name = '';
  description = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.categoryId = Number(id);
      this.loadCategory();
    }
  }

  loadCategory(): void {
    this.loading.set(true);
    this.api.get<Category>(`${API.MEDICINE_CATEGORIES}/${this.categoryId}`).subscribe({
      next: (category) => {
        this.name = category.name;
        this.description = category.description || '';
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load category.');
        this.router.navigate([ROUTES.MEDICINE_CATEGORIES]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name) {
      this.errorMessage.set('Name is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: CategoryUpdate = {
        name: this.name,
        description: this.description || undefined,
      };

      this.api.put<Category>(`${API.MEDICINE_CATEGORIES}/${this.categoryId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Category updated successfully.');
          this.router.navigate([ROUTES.MEDICINE_CATEGORIES]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update category.');
        },
      });
    } else {
      const data: CategoryCreate = {
        name: this.name,
        description: this.description || undefined,
      };

      this.api.post<Category>(API.MEDICINE_CATEGORIES, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Category created successfully.');
          this.router.navigate([ROUTES.MEDICINE_CATEGORIES]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create category.');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate([ROUTES.MEDICINE_CATEGORIES]);
  }
}
