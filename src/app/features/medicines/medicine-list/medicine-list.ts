import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicinesService } from '../medicines';
import { Medicine, MedicineCategory, DOSAGE_FORM_LABELS, DosageForm } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-medicine-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineListComponent implements OnInit {
  private readonly medicinesService = inject(MedicinesService);
  private readonly router = inject(Router);

  protected readonly medicines = signal<Medicine[]>([]);
  protected readonly categories = signal<MedicineCategory[]>([]);
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
    { key: 'generic_name', label: 'Generic Name', sortable: true },
    { key: 'dosage_form', label: 'Form', sortable: true },
    { key: 'strength', label: 'Strength', sortable: false },
    { key: 'manufacturer', label: 'Manufacturer', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  ngOnInit(): void {
    this.loadMedicines();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.medicinesService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  protected loadMedicines(): void {
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

    this.medicinesService.list(params).subscribe({
      next: (response) => {
        this.medicines.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medicines');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadMedicines();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadMedicines();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadMedicines();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadMedicines();
  }

  protected createMedicine(): void {
    this.router.navigate(['/medicines/new']);
  }

  protected viewMedicine(medicine: Medicine): void {
    this.router.navigate(['/medicines', medicine.id]);
  }

  protected deleteMedicine(medicine: Medicine): void {
    if (confirm(`Are you sure you want to delete "${medicine.name}"?`)) {
      this.medicinesService.delete(medicine.id).subscribe({
        next: () => this.loadMedicines(),
        error: (err) => {
          this.error.set('Failed to delete medicine');
          console.error(err);
        }
      });
    }
  }

  protected getDosageFormLabel(form: DosageForm): string {
    return DOSAGE_FORM_LABELS[form] || form;
  }
}

