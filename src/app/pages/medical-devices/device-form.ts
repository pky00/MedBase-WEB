import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { MedicalDevice, MedicalDeviceCreate, MedicalDeviceUpdate } from '../../core/models/medical-device.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-device-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  categoryOptions = signal<DropdownOption[]>([]);
  categoryPage = 1;
  categoryHasMore = signal(false);

  deviceId: number | null = null;
  name = '';
  description = '';
  categoryId: number | null = null;
  manufacturer = '';
  deviceModel = '';
  serialNumber = '';
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
      this.deviceId = Number(id);
      this.loadDevice();
    }
  }

  loadCategories(search?: string): void {
    const params: QueryParams = { page: this.categoryPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Category>(API.MEDICAL_DEVICE_CATEGORIES, params).subscribe({
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

  loadDevice(): void {
    this.loading.set(true);
    this.api.get<MedicalDevice>(`${API.MEDICAL_DEVICES}/${this.deviceId}`).subscribe({
      next: (device) => {
        this.name = device.name;
        this.description = device.description || '';
        this.categoryId = device.category_id;
        this.manufacturer = device.manufacturer || '';
        this.deviceModel = device.model || '';
        this.serialNumber = device.serial_number || '';
        this.isActive = device.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medical device.');
        this.router.navigate([ROUTES.MEDICAL_DEVICES]);
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
      const data: MedicalDeviceUpdate = {
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        manufacturer: this.manufacturer || undefined,
        model: this.deviceModel || undefined,
        serial_number: this.serialNumber || undefined,
        is_active: this.isActive,
      };

      this.api.put<MedicalDevice>(`${API.MEDICAL_DEVICES}/${this.deviceId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Medical device updated successfully.');
          this.router.navigate([ROUTES.MEDICAL_DEVICES, this.deviceId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update medical device.');
        },
      });
    } else {
      const data: MedicalDeviceCreate = {
        name: this.name,
        description: this.description || undefined,
        category_id: this.categoryId,
        manufacturer: this.manufacturer || undefined,
        model: this.deviceModel || undefined,
        serial_number: this.serialNumber || undefined,
        is_active: this.isActive,
      };

      this.api.post<MedicalDevice>(API.MEDICAL_DEVICES, data).subscribe({
        next: (device) => {
          this.saving.set(false);
          this.notification.success('Medical device created successfully.');
          this.router.navigate([ROUTES.MEDICAL_DEVICES, device.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create medical device.');
        },
      });
    }
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.MEDICAL_DEVICES]);
  }
}
