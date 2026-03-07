import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import {
  AppointmentDetail,
  MedicalRecord,
  MedicalRecordCreate,
  MedicalRecordUpdate,
  VitalSign,
  VitalSignCreate,
  VitalSignUpdate,
} from '../../core/models/appointment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

type FlowStep = 'overview' | 'vitals' | 'record' | 'complete';

@Component({
  selector: 'app-appointment-flow',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './appointment-flow.html',
  styleUrl: './appointment-flow.scss',
})
export class AppointmentFlowComponent implements OnInit {
  appointment = signal<AppointmentDetail | null>(null);
  loading = signal(true);
  currentStep = signal<FlowStep>('overview');
  saving = signal(false);
  errorMessage = signal('');

  // Vital Signs form
  bpSystolic = '';
  bpDiastolic = '';
  heartRate = '';
  temperature = '';
  respiratoryRate = '';
  weight = '';
  height = '';
  vitalNotes = '';

  // Medical Record form
  chiefComplaint = '';
  diagnosis = '';
  treatmentNotes = '';
  followUpDate = '';

  private appointmentId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentId = Number(id);
      this.loadAppointment();
    }
  }

  loadAppointment(): void {
    this.loading.set(true);
    this.api.get<AppointmentDetail>(`${API.APPOINTMENTS}/${this.appointmentId}`).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.populateVitals(appointment.vital_signs);
        this.populateRecord(appointment.medical_record);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load appointment.');
        this.router.navigate([ROUTES.APPOINTMENTS]);
      },
    });
  }

  private populateVitals(vitals: VitalSign | null): void {
    if (!vitals) return;
    this.bpSystolic = vitals.blood_pressure_systolic?.toString() || '';
    this.bpDiastolic = vitals.blood_pressure_diastolic?.toString() || '';
    this.heartRate = vitals.heart_rate?.toString() || '';
    this.temperature = vitals.temperature || '';
    this.respiratoryRate = vitals.respiratory_rate?.toString() || '';
    this.weight = vitals.weight || '';
    this.height = vitals.height || '';
    this.vitalNotes = vitals.notes || '';
  }

  private populateRecord(record: MedicalRecord | null): void {
    if (!record) return;
    this.chiefComplaint = record.chief_complaint || '';
    this.diagnosis = record.diagnosis || '';
    this.treatmentNotes = record.treatment_notes || '';
    this.followUpDate = record.follow_up_date || '';
  }

  get isCompleted(): boolean {
    return this.appointment()?.status === 'completed';
  }

  get isCancelled(): boolean {
    return this.appointment()?.status === 'cancelled';
  }

  get isReadOnly(): boolean {
    return this.isCompleted || this.isCancelled;
  }

  setStep(step: FlowStep): void {
    this.currentStep.set(step);
    this.errorMessage.set('');
  }

  beginAppointment(): void {
    if (!this.appointmentId) return;
    this.saving.set(true);
    this.api.put(`${API.APPOINTMENTS}/${this.appointmentId}/status`, { status: 'in_progress' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Appointment started.');
        this.loadAppointment();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.notification.error(error.error?.detail || 'Failed to start appointment.');
      },
    });
  }

  saveVitals(): void {
    if (!this.appointmentId) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const data: VitalSignCreate = {
      blood_pressure_systolic: this.bpSystolic ? Number(this.bpSystolic) : null,
      blood_pressure_diastolic: this.bpDiastolic ? Number(this.bpDiastolic) : null,
      heart_rate: this.heartRate ? Number(this.heartRate) : null,
      temperature: this.temperature || null,
      respiratory_rate: this.respiratoryRate ? Number(this.respiratoryRate) : null,
      weight: this.weight || null,
      height: this.height || null,
      notes: this.vitalNotes || null,
    };

    const existingVitals = this.appointment()?.vital_signs;

    if (existingVitals) {
      this.api.put<VitalSign>(`${API.VITAL_SIGNS}/${existingVitals.id}`, data as VitalSignUpdate).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Vital signs updated.');
          this.loadAppointment();
          this.setStep('record');
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update vital signs.');
        },
      });
    } else {
      this.api.post<VitalSign>(`${API.APPOINTMENTS}/${this.appointmentId}/vitals`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Vital signs saved.');
          this.loadAppointment();
          this.setStep('record');
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to save vital signs.');
        },
      });
    }
  }

  saveMedicalRecord(): void {
    if (!this.appointmentId) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const data: MedicalRecordCreate = {
      chief_complaint: this.chiefComplaint || null,
      diagnosis: this.diagnosis || null,
      treatment_notes: this.treatmentNotes || null,
      follow_up_date: this.followUpDate || null,
    };

    const existingRecord = this.appointment()?.medical_record;

    if (existingRecord) {
      this.api.put<MedicalRecord>(`${API.MEDICAL_RECORDS}/${existingRecord.id}`, data as MedicalRecordUpdate).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Medical record updated.');
          this.loadAppointment();
          this.setStep('complete');
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update medical record.');
        },
      });
    } else {
      this.api.post<MedicalRecord>(`${API.APPOINTMENTS}/${this.appointmentId}/medical-record`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Medical record saved.');
          this.loadAppointment();
          this.setStep('complete');
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to save medical record.');
        },
      });
    }
  }

  completeAppointment(): void {
    if (!this.appointmentId) return;
    this.saving.set(true);
    this.api.put(`${API.APPOINTMENTS}/${this.appointmentId}/status`, { status: 'completed' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Appointment completed.');
        this.router.navigate([ROUTES.APPOINTMENTS, this.appointmentId]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.notification.error(error.error?.detail || 'Failed to complete appointment.');
      },
    });
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate([ROUTES.APPOINTMENTS, this.appointmentId]);
  }

  goToAppointments(): void {
    this.router.navigate([ROUTES.APPOINTMENTS]);
  }
}
