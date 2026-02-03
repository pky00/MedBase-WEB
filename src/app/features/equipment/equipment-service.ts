import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { Equipment, EquipmentCreate, EquipmentUpdate, EquipmentListResponse, EquipmentCategory, EquipmentCategoryListResponse } from '../../core/models';

export interface EquipmentListParams {
  page?: number;
  size?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
  equipment_condition?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private readonly api = inject(ApiService);

  list(params: EquipmentListParams = {}): Observable<EquipmentListResponse> {
    return this.api.get<EquipmentListResponse>('/equipment/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<Equipment> {
    return this.api.get<Equipment>(`/equipment/${id}`);
  }

  create(data: EquipmentCreate): Observable<Equipment> {
    return this.api.post<Equipment>('/equipment/', data);
  }

  update(id: string, data: EquipmentUpdate): Observable<Equipment> {
    return this.api.patch<Equipment>(`/equipment/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/equipment/${id}`);
  }

  listCategories(params: Record<string, string | number | boolean> = {}): Observable<EquipmentCategoryListResponse> {
    return this.api.get<EquipmentCategoryListResponse>('/equipment-categories/', params);
  }
}

