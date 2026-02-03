import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientsService } from '../patients';
import { Patient, GenderType, GENDER_LABELS, BLOOD_TYPE_LABELS, BloodType } from '../../../core/models';
import {
  DataTableComponent,
  TableColumn,
  SortState,
  PaginationState
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-patient-list',
  imports: [FormsModule, DataTableComponent],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly router = inject(Router);

  // State
  protected readonly patients = signal<Patient[]>([]);
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
    column: 'last_name',
    order: 'asc'
  });

  // Filters
  protected readonly search = signal('');
  protected readonly filterGender = signal<string>('');

  // Table columns configuration
  protected readonly columns: TableColumn[] = [
    { key: 'patient_number', label: 'Patient #', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'date_of_birth', label: 'Date of Birth', sortable: true },
    { key: 'gender', label: 'Gender', sortable: true },
    { key: 'blood_type', label: 'Blood Type', sortable: false },
    { key: 'phone', label: 'Phone', sortable: false },
  ];

  protected readonly genderOptions: { value: GenderType | ''; label: string }[] = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  protected loadPatients(): void {
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
    if (this.filterGender()) {
      params['gender'] = this.filterGender();
    }
    if (sortState.column) {
      params['sort_by'] = sortState.column;
    }
    if (sortState.order) {
      params['sort_order'] = sortState.order;
    }

    this.patientsService.list(params).subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.pagination.update(p => ({ ...p, total: response.total }));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load patients');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected onSortChange(sortState: SortState): void {
    this.sort.set(sortState);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadPatients();
  }

  protected onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadPatients();
  }

  protected onSearch(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadPatients();
  }

  protected onFilterChange(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadPatients();
  }

  protected createPatient(): void {
    this.router.navigate(['/patients/new']);
  }

  protected editPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id, 'edit']);
  }

  protected viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }

  protected deletePatient(patient: Patient): void {
    if (confirm(`Are you sure you want to delete "${patient.first_name} ${patient.last_name}"?`)) {
      this.patientsService.delete(patient.id).subscribe({
        next: () => this.loadPatients(),
        error: (err) => {
          this.error.set('Failed to delete patient');
          console.error(err);
        }
      });
    }
  }

  protected getGenderLabel(gender: GenderType): string {
    return GENDER_LABELS[gender] || gender;
  }

  protected getBloodTypeLabel(bloodType: BloodType | null): string {
    if (!bloodType) return '-';
    return BLOOD_TYPE_LABELS[bloodType] || bloodType;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  protected calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

