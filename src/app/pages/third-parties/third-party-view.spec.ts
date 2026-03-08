import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ThirdPartyViewComponent } from './third-party-view';

describe('ThirdPartyViewComponent', () => {
  let component: ThirdPartyViewComponent;
  let fixture: ComponentFixture<ThirdPartyViewComponent>;
  let api: { get: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockThirdParty = {
    id: 1, name: 'TP A', phone: '123', email: 'a@b.com',
    is_active: true, is_deleted: false,
    created_by: null, created_at: '2024-01-01', updated_by: null, updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    api = { get: vi.fn().mockReturnValue(of(mockThirdParty)) };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ThirdPartyViewComponent],
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
    fixture = TestBed.createComponent(ThirdPartyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load third party on init', () => {
    expect(api.get).toHaveBeenCalledWith('third-parties/1');
    expect(component.thirdParty()).toEqual(mockThirdParty);
    expect(component.loading()).toBe(false);
  });

  it('should handle load error', () => {
    api.get.mockReturnValue(throwError(() => new Error('fail')));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loadThirdParty(999);

    expect(notification.error).toHaveBeenCalledWith('Failed to load third party.');
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.editThirdParty();
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties', 1, 'edit']);
  });

  it('should navigate back to list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/third-parties']);
  });

  it('should format date time', () => {
    expect(component.formatDateTime(null)).toBe('—');
    expect(component.formatDateTime('2024-01-15T10:00:00')).toBeTruthy();
  });
});
