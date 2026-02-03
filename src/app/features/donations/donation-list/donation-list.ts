import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonationsService } from '../donations';
import { Donation, DonationType, DONATION_TYPE_LABELS } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-donation-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './donation-list.html',
  styleUrl: './donation-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationListComponent implements OnInit {
  private readonly donationsService = inject(DonationsService);
  private readonly router = inject(Router);

  protected readonly donations = signal<Donation[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'donation_date',
    order: 'desc'
  });

  protected readonly filterType = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'donation_number', label: 'Donation #', sortable: true },
    { key: 'donation_date', label: 'Date', sortable: true },
    { key: 'donor', label: 'Donor', sortable: false },
    { key: 'donation_type', label: 'Type', sortable: true },
    { key: 'total_items_count', label: 'Items', sortable: true },
    { key: 'total_estimated_value', label: 'Est. Value', sortable: true },
  ];

  protected readonly typeOptions: { value: DonationType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'medical_device', label: 'Medical Device' },
    { value: 'mixed', label: 'Mixed' }
  ];

  ngOnInit(): void {
    this.loadDonations();
  }

  protected loadDonations(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.filterType()) params['donation_type'] = this.filterType();
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.donationsService.list(params).subscribe({
      next: (response) => {
        this.donations.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load donations');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDonations();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDonations();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDonations();
  }

  protected createDonation(): void {
    this.router.navigate(['/donations/new']);
  }

  protected viewDonation(donation: Donation): void {
    this.router.navigate(['/donations', donation.id]);
  }

  protected deleteDonation(donation: Donation): void {
    if (confirm(`Are you sure you want to delete donation ${donation.donation_number}?`)) {
      this.donationsService.delete(donation.id).subscribe({
        next: () => this.loadDonations(),
        error: (err) => {
          this.error.set('Failed to delete donation');
          console.error(err);
        }
      });
    }
  }

  protected getTypeLabel(type: DonationType): string {
    return DONATION_TYPE_LABELS[type] || type;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected formatCurrency(value: number | null): string {
    if (value === null) return '-';
    return `$${value.toLocaleString()}`;
  }
}

