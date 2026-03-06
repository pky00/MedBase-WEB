import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { PatientDetail, PatientDocument, PatientDocumentType } from '../../core/models/patient.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { ModalComponent } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-patient-view',
  imports: [FormsModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent],
  templateUrl: './patient-view.html',
  styleUrl: './patient-view.scss',
})
export class PatientViewComponent implements OnInit {
  patient = signal<PatientDetail | null>(null);
  loading = signal(true);
  activeTab = signal<'documents' | 'appointments' | 'records'>('documents');

  // Documents
  documents = signal<PatientDocument[]>([]);
  documentsLoading = signal(false);
  uploading = signal(false);

  // Document types
  documentTypes = signal<PatientDocumentType[]>([]);

  // Upload document modal
  uploadModalOpen = signal(false);
  documentName = '';
  documentType = '';
  selectedFile: File | null = null;

  // Delete document modal
  deleteDocModalOpen = signal(false);
  docToDelete = signal<PatientDocument | null>(null);
  deletingDoc = signal(false);

  private patientId: number | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = Number(id);
      this.loadPatient();
      this.loadDocuments();
      this.loadDocumentTypes();
    }
  }

  loadPatient(): void {
    this.loading.set(true);
    this.api.get<PatientDetail>(`${API.PATIENTS}/${this.patientId}`).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load patient.');
        this.router.navigate([ROUTES.PATIENTS]);
      },
    });
  }

  loadDocuments(): void {
    if (!this.patientId) return;
    this.documentsLoading.set(true);
    const params: QueryParams = { page: 1, size: 100 };
    this.api.getList<PatientDocument>(`${API.PATIENTS}/${this.patientId}/documents`, params).subscribe({
      next: (response: PaginatedResponse<PatientDocument>) => {
        this.documents.set(response.items);
        this.documentsLoading.set(false);
      },
      error: () => {
        this.documentsLoading.set(false);
        this.notification.error('Failed to load documents.');
      },
    });
  }

  loadDocumentTypes(): void {
    this.api.get<PatientDocumentType[]>(API.PATIENT_DOCUMENT_TYPES).subscribe({
      next: (types) => this.documentTypes.set(types),
      error: () => {},
    });
  }

  openUploadModal(): void {
    this.documentName = '';
    this.documentType = '';
    this.selectedFile = null;
    this.uploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.uploadModalOpen.set(false);
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.patientId) return;

    this.uploading.set(true);

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    if (this.documentName.trim()) {
      formData.append('document_name', this.documentName.trim());
    }
    if (this.documentType.trim()) {
      formData.append('document_type', this.documentType.trim());
    }

    this.api.postFormData<PatientDocument>(
      `${API.PATIENTS}/${this.patientId}/documents`,
      formData
    ).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadModalOpen.set(false);
        this.selectedFile = null;
        this.documentName = '';
        this.documentType = '';
        this.notification.success('Document uploaded successfully.');
        this.loadDocuments();
      },
      error: () => {
        this.uploading.set(false);
        this.notification.error('Failed to upload document.');
      },
    });
  }

  openDeleteDocModal(doc: PatientDocument): void {
    this.docToDelete.set(doc);
    this.deleteDocModalOpen.set(true);
  }

  confirmDeleteDoc(): void {
    const doc = this.docToDelete();
    if (!doc) return;

    this.deletingDoc.set(true);
    this.api.delete(`${API.PATIENT_DOCUMENTS}/${doc.id}`).subscribe({
      next: () => {
        this.deletingDoc.set(false);
        this.deleteDocModalOpen.set(false);
        this.docToDelete.set(null);
        this.notification.success('Document deleted successfully.');
        this.loadDocuments();
      },
      error: () => {
        this.deletingDoc.set(false);
        this.notification.error('Failed to delete document.');
      },
    });
  }

  cancelDeleteDoc(): void {
    this.deleteDocModalOpen.set(false);
    this.docToDelete.set(null);
  }

  setTab(tab: 'documents' | 'appointments' | 'records'): void {
    this.activeTab.set(tab);
  }

  formatGender(gender: string | null): string {
    const map: Record<string, string> = { male: 'Male', female: 'Female' };
    return gender ? map[gender] || gender : '—';
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  editPatient(): void {
    this.router.navigate([ROUTES.PATIENTS, this.patientId, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.PATIENTS]);
  }
}
