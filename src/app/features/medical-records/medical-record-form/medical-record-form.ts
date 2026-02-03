import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicalRecordsService } from '../medical-records';
import { PatientsService } from '../../patients/patients';
import { DoctorsService } from '../../doctors/doctors';
import { Patient, Doctor } from '../../../core/models';

@Component({
  selector: 'app-medical-record-form',
  imports: [ReactiveFormsModule],
  templateUrl: './medical-record-form.html',
  styleUrl: './medical-record-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalRecordFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly patientsService = inject(PatientsService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly recordId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly doctors = signal<Doctor[]>([]);

  constructor() {
    this.form = this.fb.group({
      patient_id: ['', [Validators.required]],
      doctor_id: ['', [Validators.required]],
      visit_date: ['', [Validators.required]],
      chief_complaint: [''],
      history_of_present_illness: [''],
      physical_examination: [''],
      assessment: [''],
      treatment_plan: [''],
      follow_up_instructions: [''],
      follow_up_date: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.recordId.set(id);
      this.loadRecord(id);
    } else {
      this.isViewMode.set(false);
      this.form.patchValue({ visit_date: new Date().toISOString().split('T')[0] });
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

  private loadRecord(id: string): void {
    this.loading.set(true);
    this.medicalRecordsService.get(id).subscribe({
      next: (record) => {
        this.form.patchValue({
          patient_id: record.patient_id,
          doctor_id: record.doctor_id,
          visit_date: record.visit_date,
          chief_complaint: record.chief_complaint || '',
          history_of_present_illness: record.history_of_present_illness || '',
          physical_examination: record.physical_examination || '',
          assessment: record.assessment || '',
          treatment_plan: record.treatment_plan || '',
          follow_up_instructions: record.follow_up_instructions || '',
          follow_up_date: record.follow_up_date || '',
          notes: record.notes || ''
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medical record');
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
      ? this.medicalRecordsService.update(this.recordId()!, data)
      : this.medicalRecordsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadRecord(this.recordId()!);
        } else {
          this.router.navigate(['/medical-records']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save medical record');
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
      this.router.navigate(['/medical-records']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadRecord(this.recordId()!);
    } else {
      this.router.navigate(['/medical-records']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

