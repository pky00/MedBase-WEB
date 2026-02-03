import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientsService } from '../patients';
import {
  GenderType,
  BloodType,
  MaritalStatus,
  GENDER_LABELS,
  BLOOD_TYPE_LABELS,
  MARITAL_STATUS_LABELS
} from '../../../core/models';

@Component({
  selector: 'app-patient-form',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientsService = inject(PatientsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true); // Start in view mode when editing
  protected readonly patientId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly genderOptions: { value: GenderType; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  protected readonly bloodTypeOptions: { value: BloodType; label: string }[] = Object.entries(BLOOD_TYPE_LABELS)
    .map(([value, label]) => ({ value: value as BloodType, label }));

  protected readonly maritalStatusOptions: { value: MaritalStatus; label: string }[] = Object.entries(MARITAL_STATUS_LABELS)
    .map(([value, label]) => ({ value: value as MaritalStatus, label }));

  constructor() {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      date_of_birth: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      patient_number: ['', [Validators.maxLength(50)]],
      blood_type: [''],
      national_id: ['', [Validators.maxLength(50)]],
      passport_number: ['', [Validators.maxLength(50)]],
      phone: ['', [Validators.maxLength(20)]],
      alternative_phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      address: [''],
      city: ['', [Validators.maxLength(100)]],
      region: ['', [Validators.maxLength(100)]],
      country: ['', [Validators.maxLength(100)]],
      occupation: ['', [Validators.maxLength(100)]],
      marital_status: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true); // Start in view mode for existing records
      this.patientId.set(id);
      this.loadPatient(id);
    } else {
      // Creating new record - start in edit mode
      this.isViewMode.set(false);
    }
  }

  private loadPatient(id: string): void {
    this.loading.set(true);
    this.patientsService.get(id).subscribe({
      next: (patient) => {
        this.form.patchValue({
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          patient_number: patient.patient_number || '',
          blood_type: patient.blood_type || '',
          national_id: patient.national_id || '',
          passport_number: patient.passport_number || '',
          phone: patient.phone || '',
          alternative_phone: patient.alternative_phone || '',
          email: patient.email || '',
          address: patient.address || '',
          city: patient.city || '',
          region: patient.region || '',
          country: patient.country || '',
          occupation: patient.occupation || '',
          marital_status: patient.marital_status || '',
          notes: patient.notes || ''
        });
        // Disable form in view mode
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load patient');
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
    // Clean empty strings to null
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      }
    });

    const request = this.isEditMode()
      ? this.patientsService.update(this.patientId()!, data)
      : this.patientsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          // After saving, switch back to view mode
          this.isViewMode.set(true);
          this.form.disable();
          // Reload to get updated data
          this.loadPatient(this.patientId()!);
        } else {
          // If creating new, navigate to list
          this.router.navigate(['/patients']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        if (err.error?.detail) {
          this.error.set(err.error.detail);
        } else {
          this.error.set('Failed to save patient');
        }
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
      this.router.navigate(['/patients']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      // If editing, switch back to view mode
      this.isViewMode.set(true);
      this.form.disable();
      // Reload to reset form
      this.loadPatient(this.patientId()!);
    } else {
      // If creating new, navigate back
      this.router.navigate(['/patients']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  protected getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `This field is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
  }
}

