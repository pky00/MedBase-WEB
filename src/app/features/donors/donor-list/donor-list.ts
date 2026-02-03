import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonorsService } from '../donors';
import { Donor, DonorType, DONOR_TYPE_LABELS } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-donor-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './donor-list.html',
  styleUrl: './donor-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorListComponent implements OnInit {
  private readonly donorsService = inject(DonorsService);
  private readonly router = inject(Router);

  // State
  protected readonly donors = signal<Donor[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Pagination
  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  // Sorting
  protected readonly sort = signal<SortState>({
    column: null,
    order: null
  });

  // Filters
  protected readonly search = signal('');
  protected readonly filterType = signal<string>('');
  protected readonly filterStatus = signal<string>('');

  // Table columns configuration
  protected readonly columns: TableColumn[] = [
    { key: 'donor_code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'donor_type', label: 'Type', sortable: true },
    { key: 'contact_person', label: 'Contact Person', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true },
  ];

  protected readonly donorTypes: { value: DonorType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'organization', label: 'Organization' },
    { value: 'government', label: 'Government' },
    { value: 'ngo', label: 'NGO' },
    { value: 'pharmaceutical_company', label: 'Pharmaceutical Company' }
  ];

  ngOnInit(): void {
    this.loadDonors();
  }

  protected loadDonors(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.search()) {
      params['search'] = this.search();
    }
    if (this.filterType()) {
      params['donor_type'] = this.filterType();
    }
    if (this.filterStatus() !== '') {
      params['is_active'] = this.filterStatus() === 'active';
    }
    if (sortState.column) {
      params['sort_by'] = sortState.column;
    }
    if (sortState.order) {
      params['sort_order'] = sortState.order;
    }

    this.donorsService.list(params).subscribe({
      next: (response) => {
        this.donors.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load donors');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDonors();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDonors();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDonors();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDonors();
  }

  protected createDonor(): void {
    this.router.navigate(['/donors/new']);
  }

  protected viewDonor(donor: Donor): void {
    this.router.navigate(['/donors', donor.id]);
  }

  protected deleteDonor(donor: Donor): void {
    if (confirm(`Are you sure you want to delete "${donor.name}"?`)) {
      this.donorsService.delete(donor.id).subscribe({
        next: () => this.loadDonors(),
        error: (err) => {
          this.error.set('Failed to delete donor');
          console.error(err);
        }
      });
    }
  }

  protected getDonorTypeLabel(type: DonorType): string {
    return DONOR_TYPE_LABELS[type] || type;
  }
}
