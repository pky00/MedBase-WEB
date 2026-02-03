import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { User, UserCreate, UserUpdate } from '../../core/models';

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  size: number;
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly api = inject(ApiService);

  list(params: UserListParams = {}): Observable<UserListResponse> {
    return this.api.get<UserListResponse>('/users/', params as Record<string, string | number | boolean>);
  }

  get(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: UserCreate): Observable<User> {
    return this.api.post<User>('/users/', data);
  }

  update(id: string, data: UserUpdate): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}

