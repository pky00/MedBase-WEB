import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { UserListComponent } from './user-list';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let api: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = {
    items: [{ id: 1, username: 'admin', third_party: { name: 'Admin', email: 'a@b.com' }, role: 'admin', is_active: true }],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
  };

  beforeEach(async () => {
    api = {
      getList: vi.fn().mockReturnValue(of(mockResponse)),
      delete: vi.fn().mockReturnValue(of({})),
    };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(api.getList).toHaveBeenCalledWith('users', expect.objectContaining({ page: 1 }));
    expect(component.users().length).toBe(1);
    expect(component.table.totalItems()).toBe(1);
  });

  it('should show error on load failure', () => {
    api.getList.mockReturnValue(throwError(() => new Error('fail')));
    component.loadUsers();
    expect(notification.error).toHaveBeenCalledWith('Failed to load users.');
    expect(component.table.loading()).toBe(false);
  });

  describe('onAction', () => {
    it('should navigate to view on view action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'view', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/users', 1]);
    });

    it('should navigate to edit on edit action', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onAction({ action: 'edit', item: { id: 1 } });
      expect(navigateSpy).toHaveBeenCalledWith(['/users', 1, 'edit']);
    });

    it('should open delete modal on delete action', () => {
      component.onAction({ action: 'delete', item: { id: 1, username: 'test' } });
      expect(component.deleteModalOpen()).toBe(true);
      expect(component.userToDelete()).toEqual({ id: 1, username: 'test' });
    });
  });

  it('should navigate to new user page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.createUser();
    expect(navigateSpy).toHaveBeenCalledWith(['/users/new']);
  });

  describe('delete', () => {
    it('should delete user and reload', () => {
      component.userToDelete.set({ id: 1, username: 'test' });
      component.confirmDelete();

      expect(api.delete).toHaveBeenCalledWith('users/1');
      expect(notification.success).toHaveBeenCalledWith('User deleted successfully.');
      expect(component.deleteModalOpen()).toBe(false);
    });

    it('should show error on delete failure', () => {
      api.delete.mockReturnValue(throwError(() => new Error('fail')));
      component.userToDelete.set({ id: 1, username: 'test' });
      component.confirmDelete();

      expect(notification.error).toHaveBeenCalledWith('Failed to delete user.');
      expect(component.deleting()).toBe(false);
    });

    it('should not delete when no user selected', () => {
      component.userToDelete.set(null);
      component.confirmDelete();
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  it('should cancel delete', () => {
    component.deleteModalOpen.set(true);
    component.userToDelete.set({ id: 1 });
    component.cancelDelete();
    expect(component.deleteModalOpen()).toBe(false);
    expect(component.userToDelete()).toBeNull();
  });
});
