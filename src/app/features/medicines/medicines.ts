import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Medicine, MedicineCreate, MedicineUpdate, MedicineListResponse, MedicineCategory, MedicineCategoryListResponse } from '../../core/models';

export interface MedicineListParams {
  page?: number;
  size?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class MedicinesService {
  private readonly api = inject(ApiService);

  list(params: MedicineListParams = {}): Observable<MedicineListResponse> {
    return this.api.get<MedicineListResponse>('/medicines/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Medicine> {
    return this.api.get<Medicine>(`/medicines/${id}`);
  }

  create(data: MedicineCreate): Observable<Medicine> {
    return this.api.post<Medicine>('/medicines/', data);
  }

  update(id: string, data: MedicineUpdate): Observable<Medicine> {
    return this.api.patch<Medicine>(`/medicines/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/medicines/${id}`);
  }

  listCategories(params: Record<string, string | number | boolean> = {}): Observable<MedicineCategoryListResponse> {
    return this.api.get<MedicineCategoryListResponse>('/medicine-categories/', params);
  }
}

