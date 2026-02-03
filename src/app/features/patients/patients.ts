import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Patient, PatientCreate, PatientUpdate, PatientListResponse } from '../../core/models';

export interface PatientListParams {
  page?: number;
  size?: number;
  search?: string;
  gender?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly api = inject(ApiService);

  list(params: PatientListParams = {}): Observable<PatientListResponse> {
    return this.api.get<PatientListResponse>('/patients/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Patient> {
    return this.api.get<Patient>(`/patients/${id}`);
  }

  create(data: PatientCreate): Observable<Patient> {
    return this.api.post<Patient>('/patients/', data);
  }

  update(id: string, data: PatientUpdate): Observable<Patient> {
    return this.api.patch<Patient>(`/patients/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/patients/${id}`);
  }
}

