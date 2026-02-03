import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordListResponse } from '../../core/models';

export interface MedicalRecordListParams {
  page?: number;
  size?: number;
  patient_id?: string;
  doctor_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsService {
  private readonly api = inject(ApiService);

  list(params: MedicalRecordListParams = {}): Observable<MedicalRecordListResponse> {
    return this.api.get<MedicalRecordListResponse>('/medical-records/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<MedicalRecord> {
    return this.api.get<MedicalRecord>(`/medical-records/${id}`);
  }

  create(data: MedicalRecordCreate): Observable<MedicalRecord> {
    return this.api.post<MedicalRecord>('/medical-records/', data);
  }

  update(id: string, data: MedicalRecordUpdate): Observable<MedicalRecord> {
    return this.api.patch<MedicalRecord>(`/medical-records/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/medical-records/${id}`);
  }
}

