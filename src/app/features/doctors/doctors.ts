import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Doctor, DoctorCreate, DoctorUpdate, DoctorListResponse } from '../../core/models';

export interface DoctorListParams {
  page?: number;
  size?: number;
  search?: string;
  specialization?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private readonly api = inject(ApiService);

  list(params: DoctorListParams = {}): Observable<DoctorListResponse> {
    return this.api.get<DoctorListResponse>('/doctors/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Doctor> {
    return this.api.get<Doctor>(`/doctors/${id}`);
  }

  create(data: DoctorCreate): Observable<Doctor> {
    return this.api.post<Doctor>('/doctors/', data);
  }

  update(id: string, data: DoctorUpdate): Observable<Doctor> {
    return this.api.patch<Doctor>(`/doctors/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/doctors/${id}`);
  }
}

