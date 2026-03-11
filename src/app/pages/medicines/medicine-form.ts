import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { Medicine, MedicineCreate, MedicineUpdate } from '../../core/models/medicine.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-medicine-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.scss',
})
export class MedicineFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  categoryOptions = signal<DropdownOption[]>([]);
  categoryPage = 1;
  categoryHasMore = signal(false);

  medicineId: number | null = null;
  code = '';
  name = '';
  description = '';
  categoryId: number | null = null;
  unit = '';
  isActive = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.medicineId = Number(id);
      this.loadMedicine();
    }
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
        this.ensureCategoryOption();
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

  private loadedCategoryName: string | null = null;

  private ensureCategoryOption(): void {
    if (this.categoryId && this.loadedCategoryName) {
      const exists = this.categoryOptions().some((o) => o.value === this.categoryId);
      if (!exists) {
        this.categoryOptions.update((prev) => [
          { value: this.categoryId!, label: this.loadedCategoryName! },
          ...prev,
        ]);
      }
    }
  }

  loadMedicine(): void {
    this.loading.set(true);
    this.api.get<Medicine>(`${API.MEDICINES}/${this.medicineId}`).subscribe({
      next: (medicine) => {
        this.code = medicine.code || '';
        this.name = medicine.name;
        this.description = medicine.description || '';
        this.categoryId = medicine.category_id;
        this.loadedCategoryName = medicine.category?.name || null;
        this.unit = medicine.unit || '';
        this.isActive = medicine.is_active;
        this.ensureCategoryOption();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medicine.');
        this.router.navigate([ROUTES.MEDICINES]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name || !this.categoryId || !this.code) {
      this.errorMessage.set('Code, name and category are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: MedicineUpdate = {
        code: this.code || undefined,
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        unit: this.unit || undefined,
        is_active: this.isActive,
      };

      this.api.put<Medicine>(`${API.MEDICINES}/${this.medicineId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Medicine updated successfully.');
          this.router.navigate([ROUTES.MEDICINES, this.medicineId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update medicine.');
        },
      });
    } else {
      const data: MedicineCreate = {
        code: this.code,
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        unit: this.unit || undefined,
        is_active: this.isActive,
      };

      this.api.post<Medicine>(API.MEDICINES, data).subscribe({
        next: (medicine) => {
          this.saving.set(false);
          this.notification.success('Medicine created successfully.');
          this.router.navigate([ROUTES.MEDICINES, medicine.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create medicine.');
        },
      });
    }
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.MEDICINES]);
  }
}
