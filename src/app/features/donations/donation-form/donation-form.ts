import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DonationsService } from '../donations';
import { DonorsService } from '../../donors/donors';
import {
  Donor,
  DonationType,
  DONATION_TYPE_LABELS,
  DonationMedicineItem,
  DonationEquipmentItem,
  DonationMedicalDeviceItem
} from '../../../core/models';

@Component({
  selector: 'app-donation-form',
  imports: [ReactiveFormsModule],
  templateUrl: './donation-form.html',
  styleUrl: './donation-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly donationsService = inject(DonationsService);
  private readonly donorsService = inject(DonorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly donationId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly donors = signal<Donor[]>([]);

  protected readonly typeOptions = Object.entries(DONATION_TYPE_LABELS)
    .map(([value, label]) => ({ value: value as DonationType, label }));

  constructor() {
    this.form = this.fb.group({
      donor_id: ['', [Validators.required]],
      donation_type: ['medicine', [Validators.required]],
      donation_date: ['', [Validators.required]],
      received_date: [''],
      total_estimated_value: [null],
      total_items_count: [0],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDonors();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.donationId.set(id);
      this.loadDonation(id);
    } else {
      this.isViewMode.set(false);
      // Set default date to today
      this.form.patchValue({ donation_date: new Date().toISOString().split('T')[0] });
    }
  }

  private loadDonors(): void {
    this.donorsService.list({ size: 1000, is_active: true }).subscribe({
      next: (response) => this.donors.set(response.data),
      error: (err) => console.error('Failed to load donors', err)
    });
  }

  private loadDonation(id: string): void {
    this.loading.set(true);
    this.donationsService.get(id).subscribe({
      next: (donation) => {
        this.form.patchValue({
          donor_id: donation.donor_id,
          donation_type: donation.donation_type,
          donation_date: donation.donation_date,
          received_date: donation.received_date || '',
          total_estimated_value: donation.total_estimated_value,
          total_items_count: donation.total_items_count,
          notes: donation.notes || ''
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load donation');
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
      ? this.donationsService.update(this.donationId()!, data)
      : this.donationsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadDonation(this.donationId()!);
        } else {
          this.router.navigate(['/donations']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save donation');
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
      this.router.navigate(['/donations']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadDonation(this.donationId()!);
    } else {
      this.router.navigate(['/donations']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

