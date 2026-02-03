import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { MedicalDevice, MedicalDeviceCreate, MedicalDeviceUpdate, MedicalDeviceListResponse, MedicalDeviceCategory, MedicalDeviceCategoryListResponse } from '../../core/models';

export interface MedicalDeviceListParams {
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
export class MedicalDevicesService {
  private readonly api = inject(ApiService);

  list(params: MedicalDeviceListParams = {}): Observable<MedicalDeviceListResponse> {
    return this.api.get<MedicalDeviceListResponse>('/medical-devices/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<MedicalDevice> {
    return this.api.get<MedicalDevice>(`/medical-devices/${id}`);
  }

  create(data: MedicalDeviceCreate): Observable<MedicalDevice> {
    return this.api.post<MedicalDevice>('/medical-devices/', data);
  }

  update(id: string, data: MedicalDeviceUpdate): Observable<MedicalDevice> {
    return this.api.patch<MedicalDevice>(`/medical-devices/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/medical-devices/${id}`);
  }

  listCategories(params: Record<string, string | number | boolean> = {}): Observable<MedicalDeviceCategoryListResponse> {
    return this.api.get<MedicalDeviceCategoryListResponse>('/medical-device-categories/', params);
  }
}

