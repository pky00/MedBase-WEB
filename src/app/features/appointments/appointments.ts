import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Appointment, AppointmentCreate, AppointmentUpdate, AppointmentListResponse } from '../../core/models';

export interface AppointmentListParams {
  page?: number;
  size?: number;
  patient_id?: string;
  doctor_id?: string;
  status?: string;
  appointment_type?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly api = inject(ApiService);

  list(params: AppointmentListParams = {}): Observable<AppointmentListResponse> {
    return this.api.get<AppointmentListResponse>('/appointments/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  create(data: AppointmentCreate): Observable<Appointment> {
    return this.api.post<Appointment>('/appointments/', data);
  }

  update(id: string, data: AppointmentUpdate): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/appointments/${id}`);
  }
}

