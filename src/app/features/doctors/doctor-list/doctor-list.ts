import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../doctors';
import { Doctor, GENDER_LABELS, GenderType } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-doctor-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorListComponent implements OnInit {
  private readonly doctorsService = inject(DoctorsService);
  private readonly router = inject(Router);

  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pagination = signal<PaginationState>({
    page: 1,
    size: 10,
    total: 0
  });

  protected readonly sort = signal<SortState>({
    column: 'last_name',
    order: 'asc'
  });

  protected readonly search = signal('');
  protected readonly filterSpecialization = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'specialization', label: 'Specialization', sortable: true },
    { key: 'gender', label: 'Gender', sortable: false },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'email', label: 'Email', sortable: true },
  ];

  ngOnInit(): void {
    this.loadDoctors();
  }

  protected loadDoctors(): void {
    this.loading.set(true);
    this.error.set(null);

    const pag = this.pagination();
    const sortState = this.sort();

    const params: Record<string, string | number | boolean> = {
      page: pag.page,
      size: pag.size
    };

    if (this.search()) params['search'] = this.search();
    if (this.filterSpecialization()) params['specialization'] = this.filterSpecialization();
    if (sortState.column) params['sort_by'] = sortState.column;
    if (sortState.order) params['sort_order'] = sortState.order;

    this.doctorsService.list(params).subscribe({
      next: (response) => {
        this.doctors.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load doctors');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDoctors();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDoctors();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDoctors();
  }

  protected createDoctor(): void {
    this.router.navigate(['/doctors/new']);
  }

  protected editDoctor(doctor: Doctor): void {
    this.router.navigate(['/doctors', doctor.id, 'edit']);
  }

  protected viewDoctor(doctor: Doctor): void {
    this.router.navigate(['/doctors', doctor.id]);
  }

  protected deleteDoctor(doctor: Doctor): void {
    if (confirm(`Are you sure you want to delete Dr. ${doctor.first_name} ${doctor.last_name}?`)) {
      this.doctorsService.delete(doctor.id).subscribe({
        next: () => this.loadDoctors(),
        error: (err) => {
          this.error.set('Failed to delete doctor');
          console.error(err);
        }
      });
    }
  }

  protected getGenderLabel(gender: GenderType | null): string {
    if (!gender) return '-';
    return GENDER_LABELS[gender] || gender;
  }
}

