import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicinesService } from '../medicines';
import { MedicineCategory, DosageForm, DOSAGE_FORM_LABELS } from '../../../core/models';

@Component({
  selector: 'app-medicine-form',
  imports: [ReactiveFormsModule],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicinesService = inject(MedicinesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly medicineId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<MedicineCategory[]>([]);

  protected readonly dosageFormOptions = Object.entries(DOSAGE_FORM_LABELS)
    .map(([value, label]) => ({ value: value as DosageForm, label }));

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.maxLength(50)]],
      generic_name: ['', [Validators.maxLength(200)]],
      brand_name: ['', [Validators.maxLength(200)]],
      category_id: [''],
      manufacturer: ['', [Validators.maxLength(200)]],
      dosage_form: ['tablet', [Validators.required]],
      strength: ['', [Validators.maxLength(50)]],
      unit: ['mg', [Validators.required, Validators.maxLength(20)]],
      package_size: ['', [Validators.maxLength(50)]],
      description: [''],
      requires_prescription: [false],
      is_controlled_substance: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.medicineId.set(id);
      this.loadMedicine(id);
    } else {
      this.isViewMode.set(false);
    }
  }

  private loadCategories(): void {
    this.medicinesService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  private loadMedicine(id: string): void {
    this.loading.set(true);
    this.medicinesService.get(id).subscribe({
      next: (medicine) => {
        this.form.patchValue({
          name: medicine.name,
          code: medicine.code || '',
          generic_name: medicine.generic_name || '',
          brand_name: medicine.brand_name || '',
          category_id: medicine.category_id || '',
          manufacturer: medicine.manufacturer || '',
          dosage_form: medicine.dosage_form,
          strength: medicine.strength || '',
          unit: medicine.unit,
          package_size: medicine.package_size || '',
          description: medicine.description || '',
          requires_prescription: medicine.requires_prescription,
          is_controlled_substance: medicine.is_controlled_substance,
          is_active: medicine.is_active
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medicine');
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
      ? this.medicinesService.update(this.medicineId()!, data)
      : this.medicinesService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadMedicine(this.medicineId()!);
        } else {
          this.router.navigate(['/medicines']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save medicine');
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
      this.router.navigate(['/medicines']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadMedicine(this.medicineId()!);
    } else {
      this.router.navigate(['/medicines']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

