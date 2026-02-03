import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../equipment-service';
import { Equipment, EquipmentCategory, EquipmentCondition, EQUIPMENT_CONDITION_LABELS } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-equipment-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentListComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);
  private readonly router = inject(Router);

  protected readonly equipment = signal<Equipment[]>([]);
  protected readonly categories = signal<EquipmentCategory[]>([]);
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
    { key: 'asset_code', label: 'Asset Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'manufacturer', label: 'Manufacturer', sortable: true },
    { key: 'equipment_condition', label: 'Condition', sortable: true },
    { key: 'is_donation', label: 'Donated', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  ngOnInit(): void {
    this.loadEquipment();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.equipmentService.listCategories({ size: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  protected loadEquipment(): void {
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

    this.equipmentService.list(params).subscribe({
      next: (response) => {
        this.equipment.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load equipment');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadEquipment();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadEquipment();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadEquipment();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadEquipment();
  }

  protected createEquipment(): void {
    this.router.navigate(['/equipment/new']);
  }

  protected viewEquipment(item: Equipment): void {
    this.router.navigate(['/equipment', item.id]);
  }

  protected deleteEquipment(item: Equipment): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.equipmentService.delete(item.id).subscribe({
        next: () => this.loadEquipment(),
        error: (err) => {
          this.error.set('Failed to delete equipment');
          console.error(err);
        }
      });
    }
  }

  protected getConditionLabel(condition: EquipmentCondition): string {
    return EQUIPMENT_CONDITION_LABELS[condition] || condition;
  }
}

