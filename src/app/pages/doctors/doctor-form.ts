import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { DoctorCreate, DoctorDetail, DoctorType, DoctorUpdate } from '../../core/models/doctor.model';
import { Partner } from '../../core/models/partner.model';
import { ThirdParty } from '../../core/models/third-party.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-doctor-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.scss',
})
export class DoctorFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  partnerOptions = signal<DropdownOption[]>([]);
  partnerPage = 1;
  partnerHasMore = signal(false);

  // Third party linking (create only)
  thirdPartyOptions = signal<DropdownOption[]>([]);
  thirdPartyPage = 1;
  thirdPartyHasMore = signal(false);
  thirdPartyId: number | null = null;

  doctorId: number | null = null;
  name = '';
  specialization = '';
  phone = '';
  email = '';
  doctorType: DoctorType = 'internal';
  partnerId: number | null = null;
  isActive = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPartners();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.doctorId = Number(id);
      this.loadDoctor();
    } else {
      this.loadThirdParties();
    }
  }

  // Third party dropdown methods
  loadThirdParties(search?: string): void {
    const params: QueryParams = { page: this.thirdPartyPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<ThirdParty>(API.THIRD_PARTIES, params).subscribe({
      next: (response) => {
        const options = response.items.map((tp) => ({ value: tp.id, label: `${tp.name} (${tp.type})` }));
        if (this.thirdPartyPage === 1) {
          this.thirdPartyOptions.set(options);
        } else {
          this.thirdPartyOptions.update((prev) => [...prev, ...options]);
        }
        this.thirdPartyHasMore.set(response.page < response.pages);
      },
    });
  }

  onThirdPartyLoadMore(): void {
    this.thirdPartyPage++;
    this.loadThirdParties();
  }

  onThirdPartySearch(search: string): void {
    this.thirdPartyPage = 1;
    this.loadThirdParties(search);
  }

  onThirdPartySelected(value: number | null): void {
    this.thirdPartyId = value;
    if (value) {
      this.api.get<ThirdParty>(`${API.THIRD_PARTIES}/${value}`).subscribe({
        next: (tp) => {
          this.name = tp.name || this.name;
          this.phone = tp.phone || this.phone;
          this.email = tp.email || this.email;
        },
      });
    }
  }

  loadPartners(search?: string): void {
    const params: QueryParams = { page: this.partnerPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Partner>(API.PARTNERS, params).subscribe({
      next: (response) => {
        const options = response.items.map((p) => ({ value: p.id, label: p.name }));
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

  onPartnerLoadMore(): void {
    this.partnerPage++;
    this.loadPartners();
  }

  onPartnerSearch(search: string): void {
    this.partnerPage = 1;
    this.loadPartners(search);
  }

  private loadedPartnerName: string | null = null;

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

  loadDoctor(): void {
    this.loading.set(true);
    this.api.get<DoctorDetail>(`${API.DOCTORS}/${this.doctorId}`).subscribe({
      next: (doctor) => {
        this.name = doctor.name;
        this.specialization = doctor.specialization || '';
        this.phone = doctor.phone || '';
        this.email = doctor.email || '';
        this.doctorType = doctor.type;
        this.partnerId = doctor.partner_id;
        this.loadedPartnerName = doctor.partner_name || null;
        this.isActive = doctor.is_active;
        this.ensurePartnerOption();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load doctor.');
        this.router.navigate([ROUTES.DOCTORS]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name || !this.doctorType) {
      this.errorMessage.set('Name and type are required.');
      return;
    }

    if (this.doctorType === 'partner_provided' && !this.partnerId) {
      this.errorMessage.set('Partner is required for partner-provided doctors.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: DoctorUpdate = {
        name: this.name,
        type: this.doctorType,
        specialization: this.specialization || undefined,
        phone: this.phone || undefined,
        email: this.email || undefined,
        partner_id: this.doctorType === 'partner_provided' ? this.partnerId : null,
        is_active: this.isActive,
      };

      this.api.put<DoctorDetail>(`${API.DOCTORS}/${this.doctorId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Doctor updated successfully.');
          this.router.navigate([ROUTES.DOCTORS, this.doctorId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update doctor.');
        },
      });
    } else {
      const data: DoctorCreate = {
        name: this.name,
        type: this.doctorType,
        specialization: this.specialization || undefined,
        phone: this.phone || undefined,
        email: this.email || undefined,
        partner_id: this.doctorType === 'partner_provided' ? this.partnerId : undefined,
        is_active: this.isActive,
        third_party_id: this.thirdPartyId || undefined,
      };

      this.api.post<DoctorDetail>(API.DOCTORS, data).subscribe({
        next: (doctor) => {
          this.saving.set(false);
          this.notification.success('Doctor created successfully.');
          this.router.navigate([ROUTES.DOCTORS, doctor.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create doctor.');
        },
      });
    }
  }

  onTypeChange(event: Event): void {
    this.doctorType = (event.target as HTMLSelectElement).value as DoctorType;
    if (this.doctorType !== 'partner_provided') {
      this.partnerId = null;
    }
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.DOCTORS]);
  }
}
