import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Gender, PatientCreate, PatientDetail, PatientUpdate } from '../../core/models/patient.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-patient-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss',
})
export class PatientFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  patientId: number | null = null;
  firstName = '';
  lastName = '';
  dateOfBirth = '';
  gender: Gender | '' = '';
  phone = '';
  email = '';
  address = '';
  emergencyContact = '';
  emergencyPhone = '';
  isActive = true;

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
      this.patientId = Number(id);
      this.loadPatient();
    }
  }

  loadPatient(): void {
    this.loading.set(true);
    this.api.get<PatientDetail>(`${API.PATIENTS}/${this.patientId}`).subscribe({
      next: (patient) => {
        this.firstName = patient.first_name;
        this.lastName = patient.last_name;
        this.dateOfBirth = patient.date_of_birth || '';
        this.gender = patient.gender || '';
        this.phone = patient.phone || '';
        this.email = patient.email || '';
        this.address = patient.address || '';
        this.emergencyContact = patient.emergency_contact || '';
        this.emergencyPhone = patient.emergency_phone || '';
        this.isActive = patient.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load patient.');
        this.router.navigate([ROUTES.PATIENTS]);
      },
    });
  }

  onSubmit(): void {
    if (!this.firstName || !this.lastName) {
      this.errorMessage.set('First name and last name are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: PatientUpdate = {
        first_name: this.firstName,
        last_name: this.lastName,
        date_of_birth: this.dateOfBirth || null,
        gender: (this.gender as Gender) || null,
        phone: this.phone || null,
        email: this.email || null,
        address: this.address || null,
        emergency_contact: this.emergencyContact || null,
        emergency_phone: this.emergencyPhone || null,
        is_active: this.isActive,
      };

      this.api.put<PatientDetail>(`${API.PATIENTS}/${this.patientId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Patient updated successfully.');
          this.router.navigate([ROUTES.PATIENTS, this.patientId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update patient.');
        },
      });
    } else {
      const data: PatientCreate = {
        first_name: this.firstName,
        last_name: this.lastName,
        date_of_birth: this.dateOfBirth || undefined,
        gender: (this.gender as Gender) || undefined,
        phone: this.phone || undefined,
        email: this.email || undefined,
        address: this.address || undefined,
        emergency_contact: this.emergencyContact || undefined,
        emergency_phone: this.emergencyPhone || undefined,
        is_active: this.isActive,
      };

      this.api.post<PatientDetail>(API.PATIENTS, data).subscribe({
        next: (patient) => {
          this.saving.set(false);
          this.notification.success('Patient created successfully.');
          this.router.navigate([ROUTES.PATIENTS, patient.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create patient.');
        },
      });
    }
  }

  onGenderChange(event: Event): void {
    this.gender = (event.target as HTMLSelectElement).value as Gender | '';
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.PATIENTS]);
  }
}
