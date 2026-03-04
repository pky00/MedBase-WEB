import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { MedicineViewComponent } from './medicine-view';

describe('MedicineViewComponent', () => {
  let component: MedicineViewComponent;
  let fixture: ComponentFixture<MedicineViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockMedicine = {
    id: 1, name: 'Amoxicillin', description: 'Antibiotic',
    category_id: 1, category_name: 'Antibiotics', is_active: true,
    quantity: 100, is_deleted: false, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockMedicine)) };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MedicineViewComponent],
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
    fixture = TestBed.createComponent(MedicineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load medicine on init', () => {
    expect(api.get).toHaveBeenCalledWith('medicines/1');
    expect(component.medicine()).toEqual(mockMedicine);
    expect(component.loading()).toBe(false);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadMedicine(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load medicine.');
    expect(navigateSpy).toHaveBeenCalledWith(['/medicines']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editMedicine();
    expect(navigateSpy).toHaveBeenCalledWith(['/medicines', 1, 'edit']);
  });

  it('should navigate back to medicines list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/medicines']);
  });
});
