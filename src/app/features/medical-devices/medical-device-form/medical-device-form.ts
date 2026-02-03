import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicalDevicesService } from '../medical-devices';
import { MedicalDeviceCategory } from '../../../core/models';

@Component({
  selector: 'app-medical-device-form',
  imports: [ReactiveFormsModule],
  templateUrl: './medical-device-form.html',
  styleUrl: './medical-device-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalDeviceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicalDevicesService = inject(MedicalDevicesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly deviceId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<MedicalDeviceCategory[]>([]);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.maxLength(50)]],
      category_id: [''],
      manufacturer: ['', [Validators.maxLength(200)]],
      model: ['', [Validators.maxLength(100)]],
      description: [''],
      specifications: [''],
      size: ['', [Validators.maxLength(50)]],
      is_reusable: [true],
      requires_fitting: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.deviceId.set(id);
      this.loadDevice(id);
    } else {
      this.isViewMode.set(false);
    }
  }

  private loadCategories(): void {
    this.medicalDevicesService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  private loadDevice(id: string): void {
    this.loading.set(true);
    this.medicalDevicesService.get(id).subscribe({
      next: (device) => {
        this.form.patchValue({
          name: device.name,
          code: device.code || '',
          category_id: device.category_id || '',
          manufacturer: device.manufacturer || '',
          model: device.model || '',
          description: device.description || '',
          specifications: device.specifications || '',
          size: device.size || '',
          is_reusable: device.is_reusable,
          requires_fitting: device.requires_fitting,
          is_active: device.is_active
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load device');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const data = { ...this.form.value };
    Object.keys(data).forEach(key => {
      if (data[key] === '') data[key] = null;
    });

    const request = this.isEditMode()
      ? this.medicalDevicesService.update(this.deviceId()!, data)
      : this.medicalDevicesService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadDevice(this.deviceId()!);
        } else {
          this.router.navigate(['/medical-devices']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save device');
        console.error(err);
      }
    });
  }

  protected toggleEditMode(): void {
    this.isViewMode.update(v => !v);
    if (this.isViewMode()) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  protected cancel(): void {
    if (this.isEditMode() && this.isViewMode()) {
      this.router.navigate(['/medical-devices']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadDevice(this.deviceId()!);
    } else {
      this.router.navigate(['/medical-devices']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

