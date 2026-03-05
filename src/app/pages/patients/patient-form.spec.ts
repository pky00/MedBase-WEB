import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PatientFormComponent } from './patient-form';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  function setup(paramId: string | null = null) {
    api = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PatientFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode', () => {
    beforeEach(() => {
      setup('new');
      fixture.detectChanges();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require first name and last name', () => {
      component.firstName = '';
      component.lastName = '';
      component.onSubmit();
      expect(component.errorMessage()).toBe('First name and last name are required.');
    });

    it('should create patient successfully', () => {
      const mockPatient = { id: 1, first_name: 'John', last_name: 'Doe' };
      api.post.mockReturnValue(of(mockPatient));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.firstName = 'John';
      component.lastName = 'Doe';
      component.gender = 'male';
      component.onSubmit();

      expect(api.post).toHaveBeenCalledWith('patients', expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
      }));
      expect(notification.success).toHaveBeenCalledWith('Patient created successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/patients', 1]);
    });

    it('should show error on create failure', () => {
      const error = new HttpErrorResponse({ error: { detail: 'Validation error' }, status: 400 });
      api.post.mockReturnValue(throwError(() => error));

      component.firstName = 'John';
      component.lastName = 'Doe';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Validation error');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    const mockPatient = {
      id: 5, first_name: 'Jane', last_name: 'Smith',
      date_of_birth: '1990-01-15', gender: 'female' as const,
      phone: '555-1234', email: 'jane@test.com', address: '123 Main St',
      emergency_contact: 'Bob', emergency_phone: '555-9999',
      is_active: true, is_deleted: false, documents: null,
      third_party_id: 10, created_at: '', updated_at: '',
      created_by: null, updated_by: null,
    };

    beforeEach(() => {
      setup('5');
      api.get.mockReturnValue(of(mockPatient));
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      expect(component.isEdit()).toBe(true);
      expect(component.patientId).toBe(5);
    });

    it('should load patient data', () => {
      expect(component.firstName).toBe('Jane');
      expect(component.lastName).toBe('Smith');
      expect(component.gender).toBe('female');
      expect(component.dateOfBirth).toBe('1990-01-15');
    });

    it('should update patient successfully', () => {
      api.put.mockReturnValue(of(mockPatient));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(api.put).toHaveBeenCalledWith('patients/5', expect.objectContaining({ first_name: 'Jane' }));
      expect(notification.success).toHaveBeenCalledWith('Patient updated successfully.');
      expect(navigateSpy).toHaveBeenCalledWith(['/patients', 5]);
    });

    it('should handle load patient error', () => {
      api.get.mockReturnValue(throwError(() => new Error('fail')));
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.loadPatient();

      expect(notification.error).toHaveBeenCalledWith('Failed to load patient.');
      expect(navigateSpy).toHaveBeenCalledWith(['/patients']);
    });
  });

  it('should update gender on change', () => {
    setup('new');
    fixture.detectChanges();
    component.onGenderChange({ target: { value: 'female' } } as unknown as Event);
    expect(component.gender).toBe('female');
  });

  it('should update isActive on active change', () => {
    setup('new');
    fixture.detectChanges();
    component.onActiveChange({ target: { value: 'false' } } as unknown as Event);
    expect(component.isActive).toBe(false);
  });

  it('should navigate back on cancel', () => {
    setup('new');
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/patients']);
  });
});
