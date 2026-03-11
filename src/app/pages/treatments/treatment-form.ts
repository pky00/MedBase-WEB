import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { Treatment, TreatmentCreate, TreatmentUpdate } from '../../core/models/treatment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-treatment-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './treatment-form.html',
  styleUrl: './treatment-form.scss',
})
export class TreatmentFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  treatmentId: number | null = null;
  treatmentType = '';
  description = '';
  treatmentDate = '';
  status = 'pending';
  cost: string = '';
  notes = '';

  // Patient dropdown
  patientOptions = signal<DropdownOption[]>([]);
  patientPage = 1;
  patientHasMore = signal(false);
  patientId: number | null = null;

  // Partner dropdown (referral partners only)
  partnerOptions = signal<DropdownOption[]>([]);
  partnerPage = 1;
  partnerHasMore = signal(false);
  partnerId: number | null = null;

  // Appointment dropdown (optional)
  appointmentOptions = signal<DropdownOption[]>([]);
  appointmentPage = 1;
  appointmentHasMore = signal(false);
  appointmentId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.treatmentId = Number(id);
      this.loadTreatment();
    } else {
      this.treatmentDate = new Date().toISOString().split('T')[0];
    }
    this.loadPatients();
    this.loadPartners();
    this.loadAppointments();
  }

  // Patient dropdown
  loadPatients(search?: string): void {
    const params: QueryParams = { page: this.patientPage, size: 50 };
    if (search) params['search'] = search;
    this.api.getList<Record<string, unknown>>(API.PATIENTS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => {
          const name = (p['third_party'] as Record<string, unknown>)?.['name'] || 'Unknown';
          return { value: p['id'] as number, label: String(name) };
        });
        if (this.patientPage === 1) {
          this.patientOptions.set(options);
        } else {
          this.patientOptions.update((prev) => [...prev, ...options]);
        }
        this.patientHasMore.set(response.page * response.size < response.total);
      },
    });
  }

  onPatientLoadMore(): void {
    this.patientPage++;
    this.loadPatients();
  }

  onPatientSearch(search: string): void {
    this.patientPage = 1;
    this.loadPatients(search);
  }

  // Partner dropdown (referral or both)
  loadPartners(search?: string): void {
    const params: QueryParams = { page: this.partnerPage, size: 50 };
    if (search) params['search'] = search;
    this.api.getList<Record<string, unknown>>(API.PARTNERS, params).subscribe({
      next: (response) => {
        const items = response.items.filter((p) => {
          const type = p['partner_type'] as string;
          return type === 'referral' || type === 'both';
        });
        const options = items.map((p) => {
          const name = (p['third_party'] as Record<string, unknown>)?.['name'] || 'Unknown';
          return { value: p['id'] as number, label: String(name) };
        });
        if (this.partnerPage === 1) {
          this.partnerOptions.set(options);
        } else {
          this.partnerOptions.update((prev) => [...prev, ...options]);
        }
        this.partnerHasMore.set(response.page * response.size < response.total);
      },
    });
  }

  onPartnerLoadMore(): void {
    this.partnerPage++;
    this.loadPartners();
  }

  onPartnerSearch(search: string): void {
    this.partnerPage = 1;
    this.loadPartners(search);
  }

  // Appointment dropdown (optional)
  loadAppointments(search?: string): void {
    const params: QueryParams = { page: this.appointmentPage, size: 50 };
    if (search) params['search'] = search;
    this.api.getList<Record<string, unknown>>(API.APPOINTMENTS, params).subscribe({
      next: (response) => {
        const options = response.items.map((a) => {
          const date = a['appointment_date'] ? new Date(a['appointment_date'] as string).toLocaleDateString() : '';
          const patient = a['patient_name'] || 'Unknown';
          return { value: a['id'] as number, label: `${date} - ${patient}` };
        });
        if (this.appointmentPage === 1) {
          this.appointmentOptions.set(options);
        } else {
          this.appointmentOptions.update((prev) => [...prev, ...options]);
        }
        this.appointmentHasMore.set(response.page * response.size < response.total);
      },
    });
  }

  onAppointmentLoadMore(): void {
    this.appointmentPage++;
    this.loadAppointments();
  }

  onAppointmentSearch(search: string): void {
    this.appointmentPage = 1;
    this.loadAppointments(search);
  }

  loadTreatment(): void {
    this.loading.set(true);
    this.api.get<Treatment>(`${API.TREATMENTS}/${this.treatmentId}`).subscribe({
      next: (treatment) => {
        this.patientId = treatment.patient_id;
        this.partnerId = treatment.partner_id;
        this.appointmentId = treatment.appointment_id;
        this.treatmentType = treatment.treatment_type;
        this.description = treatment.description || '';
        this.treatmentDate = treatment.treatment_date || '';
        this.status = treatment.status;
        this.cost = treatment.cost || '';
        this.notes = treatment.notes || '';
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load treatment.');
        this.router.navigate([ROUTES.TREATMENTS]);
      },
    });
  }

  onStatusChange(event: Event): void {
    this.status = (event.target as HTMLSelectElement).value;
  }

  onSubmit(): void {
    if (!this.patientId) {
      this.errorMessage.set('Patient is required.');
      return;
    }

    if (!this.partnerId) {
      this.errorMessage.set('Partner is required.');
      return;
    }

    if (!this.treatmentType) {
      this.errorMessage.set('Treatment type is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: TreatmentUpdate = {
        patient_id: this.patientId,
        partner_id: this.partnerId,
        appointment_id: this.appointmentId || undefined,
        treatment_type: this.treatmentType,
        description: this.description || undefined,
        treatment_date: this.treatmentDate || undefined,
        cost: this.cost ? Number(this.cost) : undefined,
        notes: this.notes || undefined,
      };

      this.api.put<Treatment>(`${API.TREATMENTS}/${this.treatmentId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Treatment updated successfully.');
          this.router.navigate([ROUTES.TREATMENTS, this.treatmentId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update treatment.');
        },
      });
    } else {
      const data: TreatmentCreate = {
        patient_id: this.patientId,
        partner_id: this.partnerId,
        appointment_id: this.appointmentId || undefined,
        treatment_type: this.treatmentType,
        description: this.description || undefined,
        treatment_date: this.treatmentDate || undefined,
        cost: this.cost ? Number(this.cost) : undefined,
        notes: this.notes || undefined,
        status: this.status as Treatment['status'],
      };

      this.api.post<Treatment>(API.TREATMENTS, data).subscribe({
        next: (treatment) => {
          this.saving.set(false);
          this.notification.success('Treatment created successfully.');
          this.router.navigate([ROUTES.TREATMENTS, treatment.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create treatment.');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate([ROUTES.TREATMENTS]);
  }
}
