import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrescriptionsService } from '../prescriptions';
import { PatientsService } from '../../patients/patients';
import { DoctorsService } from '../../doctors/doctors';
import { Patient, Doctor, PrescriptionStatus, PRESCRIPTION_STATUS_LABELS } from '../../../core/models';

@Component({
  selector: 'app-prescription-form',
  imports: [ReactiveFormsModule],
  templateUrl: './prescription-form.html',
  styleUrl: './prescription-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrescriptionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly prescriptionsService = inject(PrescriptionsService);
  private readonly patientsService = inject(PatientsService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly prescriptionId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly doctors = signal<Doctor[]>([]);

  protected readonly statusOptions = Object.entries(PRESCRIPTION_STATUS_LABELS)
    .map(([value, label]) => ({ value: value as PrescriptionStatus, label }));

  constructor() {
    this.form = this.fb.group({
      patient_id: ['', [Validators.required]],
      doctor_id: ['', [Validators.required]],
      prescription_date: ['', [Validators.required]],
      diagnosis: [''],
      notes: [''],
      pharmacy_notes: [''],
      status: ['pending'],
      is_refillable: [false],
      refills_remaining: [0],
      valid_until: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.prescriptionId.set(id);
      this.loadPrescription(id);
    } else {
      this.isViewMode.set(false);
      this.form.patchValue({ prescription_date: new Date().toISOString().split('T')[0] });
    }
  }

  private loadPatients(): void {
    this.patientsService.list({ size: 1000 }).subscribe({
      next: (response) => this.patients.set(response.data),
      error: (err) => console.error('Failed to load patients', err)
    });
  }

  private loadDoctors(): void {
    this.doctorsService.list({ size: 1000 }).subscribe({
      next: (response) => this.doctors.set(response.data),
      error: (err) => console.error('Failed to load doctors', err)
    });
  }

  private loadPrescription(id: string): void {
    this.loading.set(true);
    this.prescriptionsService.get(id).subscribe({
      next: (prescription) => {
        this.form.patchValue({
          patient_id: prescription.patient_id,
          doctor_id: prescription.doctor_id,
          prescription_date: prescription.prescription_date,
          diagnosis: prescription.diagnosis || '',
          notes: prescription.notes || '',
          pharmacy_notes: prescription.pharmacy_notes || '',
          status: prescription.status,
          is_refillable: prescription.is_refillable,
          refills_remaining: prescription.refills_remaining,
          valid_until: prescription.valid_until || ''
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load prescription');
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
      ? this.prescriptionsService.update(this.prescriptionId()!, data)
      : this.prescriptionsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadPrescription(this.prescriptionId()!);
        } else {
          this.router.navigate(['/prescriptions']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save prescription');
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
      this.router.navigate(['/prescriptions']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadPrescription(this.prescriptionId()!);
    } else {
      this.router.navigate(['/prescriptions']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

