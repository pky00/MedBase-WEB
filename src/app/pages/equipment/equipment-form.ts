import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { Equipment, EquipmentCondition, EquipmentCreate, EquipmentUpdate } from '../../core/models/equipment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-equipment-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss',
})
export class EquipmentFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  categoryOptions = signal<DropdownOption[]>([]);
  categoryPage = 1;
  categoryHasMore = signal(false);

  equipmentId: number | null = null;
  name = '';
  description = '';
  categoryId: number | null = null;
  condition: EquipmentCondition = 'new';
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
      this.equipmentId = Number(id);
      this.loadEquipment();
    }
  }

  loadCategories(search?: string): void {
    const params: QueryParams = { page: this.categoryPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Category>(API.EQUIPMENT_CATEGORIES, params).subscribe({
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

  loadEquipment(): void {
    this.loading.set(true);
    this.api.get<Equipment>(`${API.EQUIPMENT}/${this.equipmentId}`).subscribe({
      next: (equipment) => {
        this.name = equipment.name;
        this.description = equipment.description || '';
        this.categoryId = equipment.category_id;
        this.condition = equipment.condition;
        this.isActive = equipment.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load equipment.');
        this.router.navigate([ROUTES.EQUIPMENT]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name || !this.categoryId) {
      this.errorMessage.set('Name and category are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: EquipmentUpdate = {
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        condition: this.condition,
        is_active: this.isActive,
      };

      this.api.put<Equipment>(`${API.EQUIPMENT}/${this.equipmentId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Equipment updated successfully.');
          this.router.navigate([ROUTES.EQUIPMENT, this.equipmentId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update equipment.');
        },
      });
    } else {
      const data: EquipmentCreate = {
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        condition: this.condition,
        is_active: this.isActive,
      };

      this.api.post<Equipment>(API.EQUIPMENT, data).subscribe({
        next: (equipment) => {
          this.saving.set(false);
          this.notification.success('Equipment created successfully.');
          this.router.navigate([ROUTES.EQUIPMENT, equipment.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create equipment.');
        },
      });
    }
  }

  onConditionChange(event: Event): void {
    this.condition = (event.target as HTMLSelectElement).value as EquipmentCondition;
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.EQUIPMENT]);
  }
}
