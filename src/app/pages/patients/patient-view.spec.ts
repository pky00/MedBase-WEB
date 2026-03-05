import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PatientViewComponent } from './patient-view';

describe('PatientViewComponent', () => {
  let component: PatientViewComponent;
  let fixture: ComponentFixture<PatientViewComponent>;
  let api: { get: ReturnType<typeof vi.fn>; getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; postFormData: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPatient = {
    id: 1, first_name: 'John', last_name: 'Doe',
    date_of_birth: '1990-05-15', gender: 'male' as const,
    phone: '123', email: 'j@d.com', address: '123 St',
    emergency_contact: 'Jane', emergency_phone: '456',
    is_active: true, is_deleted: false, documents: null,
    third_party_id: 10, created_at: '2024-01-01T00:00:00', updated_at: '2024-01-01T00:00:00',
    created_by: null, updated_by: null,
  };

  const mockDocResponse = {
    items: [
      { id: 1, patient_id: 1, document_name: 'test.pdf', document_type: 'lab', file_path: '/test.pdf', file_url: 'https://example.com/test.pdf', upload_date: '2024-01-01T00:00:00', is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01', created_by: null, updated_by: null },
    ],
    total: 1,
    page: 1,
    size: 100,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      get: vi.fn().mockReturnValue(of(mockPatient)),
      getList: vi.fn().mockReturnValue(of(mockDocResponse)),
      delete: vi.fn().mockReturnValue(of({})),
      postFormData: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PatientViewComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PatientViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patient on init', () => {
    expect(api.get).toHaveBeenCalledWith('patients/1');
    expect(component.patient()).toEqual(mockPatient);
    expect(component.loading()).toBe(false);
  });

  it('should load documents on init', () => {
    expect(api.getList).toHaveBeenCalledWith('patients/1/documents', expect.objectContaining({ page: 1, size: 100 }));
    expect(component.documents().length).toBe(1);
  });

  it('should handle load patient error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadPatient();

    expect(notification.error).toHaveBeenCalledWith('Failed to load patient.');
    expect(navigateSpy).toHaveBeenCalledWith(['/patients']);
  });

  it('should handle load documents error', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadDocuments();
    expect(notification.error).toHaveBeenCalledWith('Failed to load documents.');
  });

  it('should switch tabs', () => {
    expect(component.activeTab()).toBe('documents');
    component.setTab('appointments');
    expect(component.activeTab()).toBe('appointments');
    component.setTab('records');
    expect(component.activeTab()).toBe('records');
  });

  it('should delete document', () => {
    const doc = mockDocResponse.items[0];
    component.openDeleteDocModal(doc);
    expect(component.deleteDocModalOpen()).toBe(true);
    expect(component.docToDelete()).toEqual(doc);

    component.confirmDeleteDoc();
    expect(api.delete).toHaveBeenCalledWith('patient-documents/1');
    expect(notification.success).toHaveBeenCalledWith('Document deleted successfully.');
    expect(component.deleteDocModalOpen()).toBe(false);
  });

  it('should handle delete document error', () => {
    api.delete.mockReturnValue(throwError(() => new Error('fail')));
    component.docToDelete.set(mockDocResponse.items[0]);
    component.confirmDeleteDoc();
    expect(notification.error).toHaveBeenCalledWith('Failed to delete document.');
    expect(component.deletingDoc()).toBe(false);
  });

  it('should cancel delete document', () => {
    component.deleteDocModalOpen.set(true);
    component.docToDelete.set(mockDocResponse.items[0]);
    component.cancelDeleteDoc();
    expect(component.deleteDocModalOpen()).toBe(false);
    expect(component.docToDelete()).toBeNull();
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editPatient();
    expect(navigateSpy).toHaveBeenCalledWith(['/patients', 1, 'edit']);
  });

  it('should navigate back to patients list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/patients']);
  });

  it('should format gender', () => {
    expect(component.formatGender('male')).toBe('Male');
    expect(component.formatGender('female')).toBe('Female');
    expect(component.formatGender(null)).toBe('—');
  });

  it('should format dates', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('1990-05-15')).toBeTruthy();
    expect(component.formatDateTime(null)).toBe('—');
    expect(component.formatDateTime('2024-01-01T00:00:00')).toBeTruthy();
  });
});
