import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import {
  AppointmentCreate,
  AppointmentDetail,
  AppointmentLocation,
  AppointmentType,
  AppointmentUpdate,
} from '../../core/models/appointment.model';
import { Patient } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { Partner } from '../../core/models/partner.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-appointment-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss',
})
export class AppointmentFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  patientOptions = signal<DropdownOption[]>([]);
  patientPage = 1;
  patientHasMore = signal(false);

  doctorOptions = signal<DropdownOption[]>([]);
  doctorPage = 1;
  doctorHasMore = signal(false);

  partnerOptions = signal<DropdownOption[]>([]);
  partnerPage = 1;
  partnerHasMore = signal(false);

  appointmentId: number | null = null;
  patientId: number | null = null;
  doctorId: number | null = null;
  partnerId: number | null = null;
  appointmentDate = '';
  appointmentType: AppointmentType = 'scheduled';
  location: AppointmentLocation = 'internal';
  notes = '';

  private loadedPatientName: string | null = null;
  private loadedDoctorName: string | null = null;
  private loadedPartnerName: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadPartners();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.appointmentId = Number(id);
      this.loadAppointment();
    }
  }

  loadPatients(search?: string): void {
    const params: QueryParams = { page: this.patientPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Patient>(API.PATIENTS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => ({
          value: p.id,
          label: `${p.first_name} ${p.last_name}`,
        }));
        if (this.patientPage === 1) {
          this.patientOptions.set(options);
        } else {
          this.patientOptions.update((prev) => [...prev, ...options]);
        }
        this.patientHasMore.set(response.page < response.pages);
        this.ensurePatientOption();
      },
    });
  }

  loadDoctors(search?: string): void {
    const params: QueryParams = { page: this.doctorPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Doctor>(API.DOCTORS, params).subscribe({
      next: (response) => {
        const options = response.items.map((d) => ({ value: d.id, label: d.third_party?.name || `Doctor #${d.id}` }));
        if (this.doctorPage === 1) {
          this.doctorOptions.set(options);
        } else {
          this.doctorOptions.update((prev) => [...prev, ...options]);
        }
        this.doctorHasMore.set(response.page < response.pages);
        this.ensureDoctorOption();
      },
    });
  }

  loadPartners(search?: string): void {
    const params: QueryParams = { page: this.partnerPage, size: 50, partner_type: 'referral' };
    if (search) params['search'] = search;

    this.api.getList<Partner>(API.PARTNERS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => ({ value: p.id, label: p.third_party?.name || `Partner #${p.id}` }));
        if (this.partnerPage === 1) {
          this.partnerOptions.set(options);
        } else {
          this.partnerOptions.update((prev) => [...prev, ...options]);
        }
        this.partnerHasMore.set(response.page < response.pages);
        this.ensurePartnerOption();
      },
    });
  }

  onPatientLoadMore(): void { this.patientPage++; this.loadPatients(); }
  onPatientSearch(search: string): void { this.patientPage = 1; this.loadPatients(search); }
  onDoctorLoadMore(): void { this.doctorPage++; this.loadDoctors(); }
  onDoctorSearch(search: string): void { this.doctorPage = 1; this.loadDoctors(search); }
  onPartnerLoadMore(): void { this.partnerPage++; this.loadPartners(); }
  onPartnerSearch(search: string): void { this.partnerPage = 1; this.loadPartners(search); }

  private ensurePatientOption(): void {
    if (this.patientId && this.loadedPatientName) {
      const exists = this.patientOptions().some((o) => o.value === this.patientId);
      if (!exists) {
        this.patientOptions.update((prev) => [
          { value: this.patientId!, label: this.loadedPatientName! },
          ...prev,
        ]);
      }
    }
  }

  private ensureDoctorOption(): void {
    if (this.doctorId && this.loadedDoctorName) {
      const exists = this.doctorOptions().some((o) => o.value === this.doctorId);
      if (!exists) {
        this.doctorOptions.update((prev) => [
          { value: this.doctorId!, label: this.loadedDoctorName! },
          ...prev,
        ]);
      }
    }
  }

  private ensurePartnerOption(): void {
    if (this.partnerId && this.loadedPartnerName) {
      const exists = this.partnerOptions().some((o) => o.value === this.partnerId);
      if (!exists) {
        this.partnerOptions.update((prev) => [
          { value: this.partnerId!, label: this.loadedPartnerName! },
          ...prev,
        ]);
      }
    }
  }

  loadAppointment(): void {
    this.loading.set(true);
    this.api.get<AppointmentDetail>(`${API.APPOINTMENTS}/${this.appointmentId}`).subscribe({
      next: (appointment) => {
        this.patientId = appointment.patient_id;
        this.doctorId = appointment.doctor_id;
        this.partnerId = appointment.partner_id;
        this.appointmentDate = this.formatDateTimeLocal(appointment.appointment_date);
        this.appointmentType = appointment.type;
        this.location = appointment.location;
        this.notes = appointment.notes || '';
        this.loadedPatientName = appointment.patient_name || null;
        this.loadedDoctorName = appointment.doctor_name || null;
        this.loadedPartnerName = appointment.partner_name || null;
        this.ensurePatientOption();
        this.ensureDoctorOption();
        this.ensurePartnerOption();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load appointment.');
        this.router.navigate([ROUTES.APPOINTMENTS]);
      },
    });
  }

  private formatDateTimeLocal(dateStr: string): string {
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  onSubmit(): void {
    if (!this.patientId) {
      this.errorMessage.set('Patient is required.');
      return;
    }
    if (!this.appointmentDate) {
      this.errorMessage.set('Appointment date is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: AppointmentUpdate = {
        patient_id: this.patientId,
        doctor_id: this.doctorId,
        partner_id: this.location === 'external' ? this.partnerId : null,
        appointment_date: new Date(this.appointmentDate).toISOString(),
        type: this.appointmentType,
        location: this.location,
        notes: this.notes || null,
      };

      this.api.put<AppointmentDetail>(`${API.APPOINTMENTS}/${this.appointmentId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Appointment updated successfully.');
          this.router.navigate([ROUTES.APPOINTMENTS, this.appointmentId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update appointment.');
        },
      });
    } else {
      const data: AppointmentCreate = {
        patient_id: this.patientId,
        doctor_id: this.doctorId || undefined,
        partner_id: this.location === 'external' ? this.partnerId : undefined,
        appointment_date: new Date(this.appointmentDate).toISOString(),
        type: this.appointmentType,
        location: this.location,
        notes: this.notes || undefined,
      };

      this.api.post<AppointmentDetail>(API.APPOINTMENTS, data).subscribe({
        next: (appointment) => {
          this.saving.set(false);
          this.notification.success('Appointment created successfully.');
          this.router.navigate([ROUTES.APPOINTMENTS, appointment.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create appointment.');
        },
      });
    }
  }

  onTypeChange(event: Event): void {
    this.appointmentType = (event.target as HTMLSelectElement).value as AppointmentType;
  }

  onLocationChange(event: Event): void {
    this.location = (event.target as HTMLSelectElement).value as AppointmentLocation;
    if (this.location !== 'external') {
      this.partnerId = null;
    }
  }

  cancel(): void {
    this.router.navigate([ROUTES.APPOINTMENTS]);
  }
}
