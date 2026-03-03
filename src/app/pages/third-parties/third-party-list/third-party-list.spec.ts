import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { ThirdPartyListComponent } from './third-party-list';

describe('ThirdPartyListComponent', () => {
  let component: ThirdPartyListComponent;
  let fixture: ComponentFixture<ThirdPartyListComponent>;
  let api: { getList: ReturnType<typeof vi.fn> };
  let notification: { error: ReturnType<typeof vi.fn> };

  const mockResponse = {
    items: [{ id: 1, name: 'Test Corp', type: 'partner', is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = { getList: vi.fn().mockReturnValue(of(mockResponse)) };
    notification = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ThirdPartyListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load third parties on init', () => {
    expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ page: 1 }));
    expect(component.thirdParties().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadThirdParties();
    expect(notification.error).toHaveBeenCalledWith('Failed to load third parties.');
    expect(component.table.loading()).toBe(false);
  });

  it('should include filters in API call', () => {
    component.filterType.set('doctor');
    component.filterActive.set('true');
    component.loadThirdParties();

    expect(api.getList).toHaveBeenCalledWith(
      'third-parties',
      expect.objectContaining({ type: 'doctor', is_active: 'true' })
    );
  });
});
