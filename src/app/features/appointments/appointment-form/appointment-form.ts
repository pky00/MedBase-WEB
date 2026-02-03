import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentsService } from '../appointments';
import { PatientsService } from '../../patients/patients';
import { DoctorsService } from '../../doctors/doctors';
import {
  AppointmentType,
  AppointmentStatus,
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  Patient,
  Doctor
} from '../../../core/models';

@Component({
  selector: 'app-appointment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isViewMode = signal(true);
  protected readonly appointmentId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly patients = signal<Patient[]>([]);
  protected readonly doctors = signal<Doctor[]>([]);

  protected readonly typeOptions = Object.entries(APPOINTMENT_TYPE_LABELS)
    .map(([value, label]) => ({ value: value as AppointmentType, label }));

  protected readonly statusOptions = Object.entries(APPOINTMENT_STATUS_LABELS)
    .map(([value, label]) => ({ value: value as AppointmentStatus, label }));

  constructor() {
    this.form = this.fb.group({
      patient_id: ['', [Validators.required]],
      doctor_id: ['', [Validators.required]],
      appointment_date: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      duration_minutes: [30],
      appointment_type: ['consultation', [Validators.required]],
      status: ['scheduled'],
      chief_complaint: [''],
      notes: [''],
      is_follow_up: [false]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isViewMode.set(true);
      this.appointmentId.set(id);
      this.loadAppointment(id);
    } else {
      this.isViewMode.set(false);
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

  private loadAppointment(id: string): void {
    this.loading.set(true);
    this.appointmentsService.get(id).subscribe({
      next: (appointment) => {
        this.form.patchValue({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          duration_minutes: appointment.duration_minutes,
          appointment_type: appointment.appointment_type,
          status: appointment.status,
          chief_complaint: appointment.chief_complaint || '',
          notes: appointment.notes || '',
          is_follow_up: appointment.is_follow_up
        });
        if (this.isViewMode()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load appointment');
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
      ? this.appointmentsService.update(this.appointmentId()!, data)
      : this.appointmentsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEditMode()) {
          this.isViewMode.set(true);
          this.form.disable();
          this.loadAppointment(this.appointmentId()!);
        } else {
          this.router.navigate(['/appointments']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Failed to save appointment');
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
      this.router.navigate(['/appointments']);
    } else if (this.isEditMode() && !this.isViewMode()) {
      this.isViewMode.set(true);
      this.form.disable();
      this.loadAppointment(this.appointmentId()!);
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

