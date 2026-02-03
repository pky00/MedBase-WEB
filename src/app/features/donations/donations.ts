import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Donation, DonationCreate, DonationUpdate, DonationListResponse } from '../../core/models';

export interface DonationListParams {
  page?: number;
  size?: number;
  donor_id?: string;
  donation_type?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class DonationsService {
  private readonly api = inject(ApiService);

  list(params: DonationListParams = {}): Observable<DonationListResponse> {
    return this.api.get<DonationListResponse>('/donations/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Donation> {
    return this.api.get<Donation>(`/donations/${id}`);
  }

  create(data: DonationCreate): Observable<Donation> {
    return this.api.post<Donation>('/donations/', data);
  }

  update(id: string, data: DonationUpdate): Observable<Donation> {
    return this.api.patch<Donation>(`/donations/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/donations/${id}`);
  }
}

