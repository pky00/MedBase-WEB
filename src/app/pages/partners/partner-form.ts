import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { QueryParams } from '../../core/models/api.model';
import { OrganizationType, Partner, PartnerCreate, PartnerType, PartnerUpdate } from '../../core/models/partner.model';
import { ThirdParty } from '../../core/models/third-party.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-partner-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent, DropdownComponent],
  templateUrl: './partner-form.html',
  styleUrl: './partner-form.scss',
})
export class PartnerFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  // Third party linking (create only)
  thirdPartyOptions = signal<DropdownOption[]>([]);
  thirdPartyPage = 1;
  thirdPartyHasMore = signal(false);
  thirdPartyId: number | null = null;

  partnerId: number | null = null;
  name = '';
  partnerType: PartnerType = 'donor';
  organizationType: OrganizationType | null = null;
  contactPerson = '';
  phone = '';
  email = '';
  address = '';
  isActive = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.partnerId = Number(id);
      this.loadPartner();
    } else {
      this.loadThirdParties();
    }
  }

  // Third party dropdown methods
  loadThirdParties(search?: string): void {
    const params: QueryParams = { page: this.thirdPartyPage, size: 50, exclude_partners: true };
    if (search) params['search'] = search;

    this.api.getList<ThirdParty>(API.THIRD_PARTIES, params).subscribe({
      next: (response) => {
        const options = response.items.map((tp) => ({ value: tp.id, label: tp.name }));
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
          this.cdr.markForCheck();
        },
      });
    }
  }

  loadPartner(): void {
    this.loading.set(true);
    this.api.get<Partner>(`${API.PARTNERS}/${this.partnerId}`).subscribe({
      next: (partner) => {
        this.name = partner.name;
        this.partnerType = partner.partner_type;
        this.organizationType = partner.organization_type;
        this.contactPerson = partner.contact_person || '';
        this.phone = partner.phone || '';
        this.email = partner.email || '';
        this.address = partner.address || '';
        this.isActive = partner.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load partner.');
        this.router.navigate([ROUTES.PARTNERS]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name || !this.partnerType) {
      this.errorMessage.set('Name and partner type are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.isEdit()) {
      const data: PartnerUpdate = {
        name: this.name,
        partner_type: this.partnerType,
        organization_type: this.organizationType || undefined,
        contact_person: this.contactPerson || undefined,
        phone: this.phone || undefined,
        email: this.email || undefined,
        address: this.address || undefined,
        is_active: this.isActive,
      };

      this.api.put<Partner>(`${API.PARTNERS}/${this.partnerId}`, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Partner updated successfully.');
          this.router.navigate([ROUTES.PARTNERS, this.partnerId]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to update partner.');
        },
      });
    } else {
      const data: PartnerCreate = {
        name: this.name,
        partner_type: this.partnerType,
        organization_type: this.organizationType || undefined,
        contact_person: this.contactPerson || undefined,
        phone: this.phone || undefined,
        email: this.email || undefined,
        address: this.address || undefined,
        is_active: this.isActive,
        third_party_id: this.thirdPartyId || undefined,
      };

      this.api.post<Partner>(API.PARTNERS, data).subscribe({
        next: (partner) => {
          this.saving.set(false);
          this.notification.success('Partner created successfully.');
          this.router.navigate([ROUTES.PARTNERS, partner.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail || 'Failed to create partner.');
        },
      });
    }
  }

  onPartnerTypeChange(event: Event): void {
    this.partnerType = (event.target as HTMLSelectElement).value as PartnerType;
  }

  onOrgTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.organizationType = value ? (value as OrganizationType) : null;
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    this.router.navigate([ROUTES.PARTNERS]);
  }
}
