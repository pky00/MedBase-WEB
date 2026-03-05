import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { PartnerListComponent } from './partner-list';

describe('PartnerListComponent', () => {
  let component: PartnerListComponent;
  let fixture: ComponentFixture<PartnerListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockPartnerResponse = {
    items: [{ id: 1, name: 'Partner A', partner_type: 'donor', organization_type: 'NGO', is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockPartnerResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PartnerListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PartnerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partners on init', () => {
    expect(api.getList).toHaveBeenCalledWith('partners', expect.objectContaining({ page: 1 }));
    expect(component.partners().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadPartners();
    expect(notification.error).toHaveBeenCalledWith('Failed to load partners.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/partners', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/partners', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, name: 'Partner A' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.itemToDelete()).toEqual({ id: 1, name: 'Partner A' });
    });
  });

  it('should navigate to new partner page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createPartner();
    expect(navigateSpy).toHaveBeenCalledWith(['/partners', 'new']);
  });

  describe('delete', () => {
    it('should delete partner and reload', () => {
      component.itemToDelete.set({ id: 1, name: 'Partner A' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('partners/1');
      expect(notification.success).toHaveBeenCalledWith('Partner deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.itemToDelete.set({ id: 1, name: 'Partner A' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete partner.');
      expect(component.deleting()).toBe(false);
    });

    it('should not delete when no item selected', () => {
      component.itemToDelete.set(null);
      component.confirmDelete();
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  it('should cancel delete', () => {
    component.deleteModalOpen.set(true);
    component.itemToDelete.set({ id: 1 });
    component.cancelDelete();
    expect(component.deleteModalOpen()).toBe(false);
    expect(component.itemToDelete()).toBeNull();
  });

  it('should format partner type', () => {
    expect(component.formatPartnerType('donor')).toBe('Donor');
    expect(component.formatPartnerType('referral')).toBe('Referral');
    expect(component.formatPartnerType('both')).toBe('Both');
  });

  it('should format organization type', () => {
    expect(component.formatOrgType('NGO')).toBe('NGO');
    expect(component.formatOrgType('hospital')).toBe('Hospital');
    expect(component.formatOrgType('medical_center')).toBe('Medical Center');
  });
});
