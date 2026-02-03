import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EquipmentService } from '../equipment-service';
import { DonorsService } from '../../donors/donors';
import { EquipmentCategory, EquipmentCondition, EQUIPMENT_CONDITION_LABELS, Donor } from '../../../core/models';

@Component({
  selector: 'app-equipment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipmentService = inject(EquipmentService);
  private readonly donorsService = inject(DonorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly equipmentId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<EquipmentCategory[]>([]);
  protected readonly donors = signal<Donor[]>([]);

  protected readonly conditionOptions = Object.entries(EQUIPMENT_CONDITION_LABELS)
    .map(([value, label]) => ({ value: value as EquipmentCondition, label }));

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      asset_code: ['', [Validators.maxLength(50)]],
      category_id: [''],
      model: ['', [Validators.maxLength(100)]],
      manufacturer: ['', [Validators.maxLength(200)]],
      serial_number: ['', [Validators.maxLength(100)]],
      description: [''],
      equipment_condition: ['good', [Validators.required]],
      is_donation: [false],
      donor_id: [''],
      is_portable: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadDonors();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.equipmentId.set(id);
      this.loadEquipment(id);
    } else {
      this.isViewMode.set(false);
    }
  }

  private loadCategories(): void {
    this.equipmentService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  private loadDonors(): void {
    this.donorsService.list({ size: 1000, is_active: true }).subscribe({
      next: (response) => this.donors.set(response.data),
      error: (err) => console.error('Failed to load donors', err)
    });
  }

  private loadEquipment(id: string): void {
    this.loading.set(true);
    this.equipmentService.get(id).subscribe({
      next: (item) => {
        this.form.patchValue({
          name: item.name,
          asset_code: item.asset_code || '',
          category_id: item.category_id || '',
          model: item.model || '',
          manufacturer: item.manufacturer || '',
          serial_number: item.serial_number || '',
          description: item.description || '',
          equipment_condition: item.equipment_condition,
          is_donation: item.is_donation,
          donor_id: item.donor_id || '',
          is_portable: item.is_portable,
          is_active: item.is_active
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load equipment');
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
      ? this.equipmentService.update(this.equipmentId()!, data)
      : this.equipmentService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadEquipment(this.equipmentId()!);
        } else {
          this.router.navigate(['/equipment']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save equipment');
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
      this.router.navigate(['/equipment']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadEquipment(this.equipmentId()!);
    } else {
      this.router.navigate(['/equipment']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

