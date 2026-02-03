import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DonorsService } from '../donors';
import { DonorType, DONOR_TYPE_LABELS } from '../../../core/models';

@Component({
  selector: 'app-donor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './donor-form.html',
  styleUrl: './donor-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly donorsService = inject(DonorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly donorId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly donorTypes: { value: DonorType; label: string }[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'organization', label: 'Organization' },
    { value: 'government', label: 'Government' },
    { value: 'ngo', label: 'NGO' },
    { value: 'pharmaceutical_company', label: 'Pharmaceutical Company' }
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      donor_type: ['individual', [Validators.required]],
      donor_code: ['', [Validators.maxLength(50)]],
      contact_person: ['', [Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(20)]],
      alternative_phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      website: ['', [Validators.maxLength(255)]],
      address: [''],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(100)]],
      country: ['', [Validators.maxLength(100)]],
      notes: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.donorId.set(id);
      this.loadDonor(id);
    } else {
      this.isViewMode.set(false);
    }
  }

  private loadDonor(id: string): void {
    this.loading.set(true);
    this.donorsService.get(id).subscribe({
      next: (donor) => {
        this.form.patchValue({
          name: donor.name,
          donor_type: donor.donor_type,
          donor_code: donor.donor_code || '',
          contact_person: donor.contact_person || '',
          phone: donor.phone || '',
          alternative_phone: donor.alternative_phone || '',
          email: donor.email || '',
          website: donor.website || '',
          address: donor.address || '',
          city: donor.city || '',
          state: donor.state || '',
          country: donor.country || '',
          notes: donor.notes || '',
          is_active: donor.is_active
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load donor');
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

    const data = this.form.value;
    // Clean empty strings to null
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      }
    });

    const request = this.isEditMode()
      ? this.donorsService.update(this.donorId()!, data)
      : this.donorsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadDonor(this.donorId()!);
        } else {
          this.router.navigate(['/donors']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        if (err.error?.detail) {
          this.error.set(err.error.detail);
        } else {
          this.error.set('Failed to save donor');
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
      this.router.navigate(['/donors']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadDonor(this.donorId()!);
    } else {
      this.router.navigate(['/donors']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  protected getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
  }
}
