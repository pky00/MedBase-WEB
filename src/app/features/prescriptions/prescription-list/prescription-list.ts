import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrescriptionsService } from '../prescriptions';
import { Prescription, PrescriptionStatus, PRESCRIPTION_STATUS_LABELS } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-prescription-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './prescription-list.html',
  styleUrl: './prescription-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrescriptionListComponent implements OnInit {
  private readonly prescriptionsService = inject(PrescriptionsService);
  private readonly router = inject(Router);

  protected readonly prescriptions = signal<Prescription[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'prescription_date',
    order: 'desc'
  });

  protected readonly filterStatus = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'prescription_number', label: 'Rx #', sortable: true },
    { key: 'prescription_date', label: 'Date', sortable: true },
    { key: 'patient', label: 'Patient', sortable: false },
    { key: 'doctor', label: 'Doctor', sortable: false },
    { key: 'diagnosis', label: 'Diagnosis', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
  ];

  protected readonly statusOptions: { value: PrescriptionStatus | ''; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'dispensed', label: 'Dispensed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  protected loadPrescriptions(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.filterStatus()) params['status'] = this.filterStatus();
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.prescriptionsService.list(params).subscribe({
      next: (response) => {
        this.prescriptions.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load prescriptions');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadPrescriptions();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadPrescriptions();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadPrescriptions();
  }

  protected createPrescription(): void {
    this.router.navigate(['/prescriptions/new']);
  }

  protected viewPrescription(prescription: Prescription): void {
    this.router.navigate(['/prescriptions', prescription.id]);
  }

  protected deletePrescription(prescription: Prescription): void {
    if (confirm(`Are you sure you want to delete prescription ${prescription.prescription_number}?`)) {
      this.prescriptionsService.delete(prescription.id).subscribe({
        next: () => this.loadPrescriptions(),
        error: (err) => {
          this.error.set('Failed to delete prescription');
          console.error(err);
        }
      });
    }
  }

  protected getStatusLabel(status: PrescriptionStatus): string {
    return PRESCRIPTION_STATUS_LABELS[status] || status;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}

