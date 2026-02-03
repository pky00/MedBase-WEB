import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Prescription, PrescriptionCreate, PrescriptionUpdate, PrescriptionListResponse } from '../../core/models';

export interface PrescriptionListParams {
  page?: number;
  size?: number;
  patient_id?: string;
  doctor_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionsService {
  private readonly api = inject(ApiService);

  list(params: PrescriptionListParams = {}): Observable<PrescriptionListResponse> {
    return this.api.get<PrescriptionListResponse>('/prescriptions/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Prescription> {
    return this.api.get<Prescription>(`/prescriptions/${id}`);
  }

  create(data: PrescriptionCreate): Observable<Prescription> {
    return this.api.post<Prescription>('/prescriptions/', data);
  }

  update(id: string, data: PrescriptionUpdate): Observable<Prescription> {
    return this.api.patch<Prescription>(`/prescriptions/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/prescriptions/${id}`);
  }
}

