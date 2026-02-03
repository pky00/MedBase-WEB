import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorsService } from '../doctors';
import { GenderType, GENDER_LABELS } from '../../../core/models';

@Component({
  selector: 'app-doctor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly doctorsService = inject(DoctorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true); // Start in view mode when editing
  protected readonly doctorId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly genderOptions: { value: GenderType | ''; label: string }[] = [
    { value: '', label: 'Select gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  constructor() {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      specialization: ['', [Validators.required, Validators.maxLength(200)]],
      gender: [''],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      address: [''],
      qualification: ['', [Validators.maxLength(500)]],
      bio: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true); // Start in view mode for existing records
      this.doctorId.set(id);
      this.loadDoctor(id);
    } else {
      // Creating new record - start in edit mode
      this.isViewMode.set(false);
    }
  }

  private loadDoctor(id: string): void {
    this.loading.set(true);
    this.doctorsService.get(id).subscribe({
      next: (doctor) => {
        this.form.patchValue({
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          specialization: doctor.specialization,
          gender: doctor.gender || '',
          phone: doctor.phone || '',
          email: doctor.email || '',
          address: doctor.address || '',
          qualification: doctor.qualification || '',
          bio: doctor.bio || ''
        });
        // Disable form in view mode
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load doctor');
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
      ? this.doctorsService.update(this.doctorId()!, data)
      : this.doctorsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          // After saving, switch back to view mode
          this.isViewMode.set(true);
          this.form.disable();
          // Reload to get updated data
          this.loadDoctor(this.doctorId()!);
        } else {
          // If creating new, navigate to list
          this.router.navigate(['/doctors']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save doctor');
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
      // If viewing an existing record, just navigate back
      this.router.navigate(['/doctors']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      // If editing, switch back to view mode
      this.isViewMode.set(true);
      this.form.disable();
      // Reload to reset form
      this.loadDoctor(this.doctorId()!);
    } else {
      // If creating new, navigate back
      this.router.navigate(['/doctors']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

