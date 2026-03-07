import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { Appointment } from '../../core/models/appointment.model';
import { InventoryTransaction } from '../../core/models/inventory-transaction.model';
import { Partner } from '../../core/models/partner.model';
import { Treatment } from '../../core/models/treatment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-partner-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './partner-view.html',
  styleUrl: './partner-view.scss',
})
export class PartnerViewComponent implements OnInit {
  partner = signal<Partner | null>(null);
  loading = signal(true);
  activeTab = signal<'donations' | 'treatments' | 'appointments'>('appointments');

  // Donations (for donor/both)
  donations = signal<InventoryTransaction[]>([]);
  donationsLoading = signal(false);

  // Treatments (for referral/both)
  treatments = signal<Treatment[]>([]);
  treatmentsLoading = signal(false);

  // Referral appointments
  appointments = signal<Appointment[]>([]);
  appointmentsLoading = signal(false);

  private partnerId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.partnerId = Number(id);
      this.loadPartner(this.partnerId);
    }
  }

  loadPartner(id: number): void {
    this.loading.set(true);
    this.api.get<Partner>(`${API.PARTNERS}/${id}`).subscribe({
      next: (partner) => {
        this.partner.set(partner);
        this.loading.set(false);
        this.loadAppointments();
        if (partner.partner_type === 'donor' || partner.partner_type === 'both') {
          this.loadDonations(partner.third_party_id);
        }
        if (partner.partner_type === 'referral' || partner.partner_type === 'both') {
          this.loadTreatments();
        }
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load partner.');
        this.router.navigate([ROUTES.PARTNERS]);
      },
    });
  }

  loadDonations(thirdPartyId: number): void {
    this.donationsLoading.set(true);
    const params: QueryParams = {
      page: 1,
      size: 100,
      third_party_id: thirdPartyId,
      transaction_type: 'donation',
      sort: 'transaction_date',
      order: 'desc',
    };
    this.api.getList<InventoryTransaction>(API.INVENTORY_TRANSACTIONS, params).subscribe({
      next: (response: PaginatedResponse<InventoryTransaction>) => {
        this.donations.set(response.items);
        this.donationsLoading.set(false);
      },
      error: () => {
        this.donationsLoading.set(false);
      },
    });
  }

  loadTreatments(): void {
    if (!this.partnerId) return;
    this.treatmentsLoading.set(true);
    const params: QueryParams = {
      page: 1,
      size: 100,
      partner_id: this.partnerId,
      sort: 'treatment_date',
      order: 'desc',
    };
    this.api.getList<Treatment>(API.TREATMENTS, params).subscribe({
      next: (response: PaginatedResponse<Treatment>) => {
        this.treatments.set(response.items);
        this.treatmentsLoading.set(false);
      },
      error: () => {
        this.treatmentsLoading.set(false);
      },
    });
  }

  loadAppointments(): void {
    if (!this.partnerId) return;
    this.appointmentsLoading.set(true);
    const params: QueryParams = {
      page: 1,
      size: 100,
      partner_id: this.partnerId,
      sort: 'appointment_date',
      order: 'desc',
    };
    this.api.getList<Appointment>(API.APPOINTMENTS, params).subscribe({
      next: (response: PaginatedResponse<Appointment>) => {
        this.appointments.set(response.items);
        this.appointmentsLoading.set(false);
      },
      error: () => {
        this.appointmentsLoading.set(false);
      },
    });
  }

  viewAppointment(id: number): void {
    this.router.navigate([ROUTES.APPOINTMENTS, id]);
  }

  setTab(tab: 'donations' | 'treatments' | 'appointments'): void {
    this.activeTab.set(tab);
  }

  isDonorType(): boolean {
    const p = this.partner();
    return p?.partner_type === 'donor' || p?.partner_type === 'both';
  }

  isReferralType(): boolean {
    const p = this.partner();
    return p?.partner_type === 'referral' || p?.partner_type === 'both';
  }

  formatPartnerType(type: string): string {
    const map: Record<string, string> = {
      donor: 'Donor',
      referral: 'Referral',
      both: 'Both',
    };
    return map[type] || type;
  }

  formatOrgType(type: string | null): string {
    if (!type) return '—';
    const map: Record<string, string> = {
      NGO: 'NGO',
      organization: 'Organization',
      individual: 'Individual',
      hospital: 'Hospital',
      medical_center: 'Medical Center',
    };
    return map[type] || type;
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
    };
    return map[status] || status;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  editPartner(): void {
    this.router.navigate([ROUTES.PARTNERS, this.partner()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.PARTNERS]);
  }
}
