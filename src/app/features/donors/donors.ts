import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Donor, DonorCreate, DonorUpdate, DonorListResponse } from '../../core/models';

export interface DonorListParams {
  page?: number;
  size?: number;
  donor_type?: string;
  is_active?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class DonorsService {
  private readonly api = inject(ApiService);

  list(params: DonorListParams = {}): Observable<DonorListResponse> {
    return this.api.get<DonorListResponse>('/donors/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Donor> {
    return this.api.get<Donor>(`/donors/${id}`);
  }

  create(data: DonorCreate): Observable<Donor> {
    return this.api.post<Donor>('/donors/', data);
  }

  update(id: string, data: DonorUpdate): Observable<Donor> {
    return this.api.patch<Donor>(`/donors/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/donors/${id}`);
  }
}
