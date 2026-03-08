import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ThirdPartyListComponent } from './third-party-list';

describe('ThirdPartyListComponent', () => {
  let component: ThirdPartyListComponent;
  let fixture: ComponentFixture<ThirdPartyListComponent>;
  let api: { getList: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [{ id: 1, name: 'TP A', phone: '123', email: 'a@b.com', is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = { getList: vi.fn().mockReturnValue(of(mockResponse)) };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ThirdPartyListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
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

  it('should pass search query to API', () => {
    api.getList.mockClear();
    api.getList.mockReturnValue(of(mockResponse));
    component.searchQuery = 'test';
    component.onSearch();
    expect(api.getList).toHaveBeenCalledWith('third-parties', expect.objectContaining({ search: 'test' }));
    expect(component.table.currentPage()).toBe(1);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/third-parties', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/third-parties', 1, 'edit']);
    });
  });
});
