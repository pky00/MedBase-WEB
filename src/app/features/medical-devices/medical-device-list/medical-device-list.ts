import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicalDevicesService } from '../medical-devices';
import { MedicalDevice, MedicalDeviceCategory } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-medical-device-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './medical-device-list.html',
  styleUrl: './medical-device-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalDeviceListComponent implements OnInit {
  private readonly medicalDevicesService = inject(MedicalDevicesService);
  private readonly router = inject(Router);

  protected readonly devices = signal<MedicalDevice[]>([]);
  protected readonly categories = signal<MedicalDeviceCategory[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'name',
    order: 'asc'
  });

  protected readonly search = signal('');
  protected readonly filterCategory = signal<string>('');
  protected readonly filterStatus = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'manufacturer', label: 'Manufacturer', sortable: true },
    { key: 'model', label: 'Model', sortable: false },
    { key: 'is_reusable', label: 'Reusable', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  ngOnInit(): void {
    this.loadDevices();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.medicalDevicesService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  protected loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.search()) params['search'] = this.search();
    if (this.filterCategory()) params['category_id'] = this.filterCategory();
    if (this.filterStatus() !== '') params['is_active'] = this.filterStatus() === 'active';
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.medicalDevicesService.list(params).subscribe({
      next: (response) => {
        this.devices.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medical devices');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDevices();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDevices();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDevices();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDevices();
  }

  protected createDevice(): void {
    this.router.navigate(['/medical-devices/new']);
  }

  protected viewDevice(device: MedicalDevice): void {
    this.router.navigate(['/medical-devices', device.id]);
  }

  protected deleteDevice(device: MedicalDevice): void {
    if (confirm(`Are you sure you want to delete "${device.name}"?`)) {
      this.medicalDevicesService.delete(device.id).subscribe({
        next: () => this.loadDevices(),
        error: (err) => {
          this.error.set('Failed to delete device');
          console.error(err);
        }
      });
    }
  }
}

