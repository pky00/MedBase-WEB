import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { RecordListComponent } from './record-list';

describe('RecordListComponent', () => {
  let component: RecordListComponent;
  let fixture: ComponentFixture<RecordListComponent>;
  let api: { getList: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [
      {
        id: 1,
        appointment_id: 10,
        chief_complaint: 'Headache',
        diagnosis: 'Migraine',
        treatment_notes: null,
        follow_up_date: '2026-03-10',
        patient_name: 'John Doe',
        is_deleted: false,
        created_at: '2026-03-06T10:00:00Z',
        updated_at: '2026-03-06T10:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = { getList: vi.fn().mockReturnValue(of(mockResponse)) };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RecordListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load records on init', () => {
    expect(api.getList).toHaveBeenCalledWith('medical-records', expect.objectContaining({ page: 1 }));
    expect(component.records().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadRecords();
    expect(notification.error).toHaveBeenCalledWith('Failed to load medical records.');
    expect(component.table.loading()).toBe(false);
  });

  it('should pass patient filter to API', () => {
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockResponse));
    component.filterPatientId.set(5);
    component.loadRecords();
    expect(api.getList).toHaveBeenCalledWith('medical-records', expect.objectContaining({ patient_id: 5 }));
  });

  it('should navigate to appointment on view action', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onAction({ action: 'view', item: { id: 1, appointment_id: 10 } });
    expect(navigateSpy).toHaveBeenCalledWith(['/appointments', 10]);
  });

  it('should truncate text', () => {
    expect(component.truncateText(null)).toBe('—');
    expect(component.truncateText('Short text')).toBe('Short text');
    const longText = 'A'.repeat(60);
    expect(component.truncateText(longText)).toBe('A'.repeat(50) + '...');
  });

  it('should format dates', () => {
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-03-10')).toBeTruthy();
    expect(component.formatDateTime(null)).toBe('—');
    expect(component.formatDateTime('2026-03-06T10:00:00Z')).toBeTruthy();
  });
});
