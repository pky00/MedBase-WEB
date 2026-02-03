import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicalRecordsService } from '../medical-records';
import { MedicalRecord } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-medical-record-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './medical-record-list.html',
  styleUrl: './medical-record-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalRecordListComponent implements OnInit {
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly router = inject(Router);

  protected readonly records = signal<MedicalRecord[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'visit_date',
    order: 'desc'
  });

  protected readonly columns: TableColumn[] = [
    { key: 'record_number', label: 'Record #', sortable: true },
    { key: 'visit_date', label: 'Visit Date', sortable: true },
    { key: 'patient', label: 'Patient', sortable: false },
    { key: 'doctor', label: 'Doctor', sortable: false },
    { key: 'chief_complaint', label: 'Chief Complaint', sortable: false },
    { key: 'assessment', label: 'Assessment', sortable: false },
  ];

  ngOnInit(): void {
    this.loadRecords();
  }

  protected loadRecords(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.medicalRecordsService.list(params).subscribe({
      next: (response) => {
        this.records.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load medical records');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadRecords();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadRecords();
  }

  protected createRecord(): void {
    this.router.navigate(['/medical-records/new']);
  }

  protected viewRecord(record: MedicalRecord): void {
    this.router.navigate(['/medical-records', record.id]);
  }

  protected deleteRecord(record: MedicalRecord): void {
    if (confirm(`Are you sure you want to delete record ${record.record_number}?`)) {
      this.medicalRecordsService.delete(record.id).subscribe({
        next: () => this.loadRecords(),
        error: (err) => {
          this.error.set('Failed to delete record');
          console.error(err);
        }
      });
    }
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected truncate(text: string | null, length: number = 50): string {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

