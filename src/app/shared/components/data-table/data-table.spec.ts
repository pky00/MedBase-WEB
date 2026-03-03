import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableComponent, TableColumn } from './data-table';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('totalPages', () => {
    it('should calculate total pages', () => {
      fixture.componentRef.setInput('totalItems', 25);
      fixture.componentRef.setInput('pageSize', 10);
      expect(component.totalPages).toBe(3);
    });

    it('should return 1 when no items', () => {
      fixture.componentRef.setInput('totalItems', 0);
      expect(component.totalPages).toBe(1);
    });
  });

  describe('pages', () => {
    it('should return page numbers around current page', () => {
      fixture.componentRef.setInput('totalItems', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('currentPage', 5);
      const pages = component.pages;
      expect(pages).toContain(5);
      expect(pages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('onSort', () => {
    it('should emit sorted event for sortable column', () => {
      const spy = vi.fn();
      component.sorted.subscribe(spy);

      const column: TableColumn = { key: 'name', label: 'Name', sortable: true };
      fixture.componentRef.setInput('sortColumn', 'name');
      fixture.componentRef.setInput('sortOrder', 'asc');

      component.onSort(column);
      expect(spy).toHaveBeenCalledWith({ column: 'name', order: 'desc' });
    });

    it('should emit asc when sorting a new column', () => {
      const spy = vi.fn();
      component.sorted.subscribe(spy);

      const column: TableColumn = { key: 'email', label: 'Email', sortable: true };
      fixture.componentRef.setInput('sortColumn', 'name');

      component.onSort(column);
      expect(spy).toHaveBeenCalledWith({ column: 'email', order: 'asc' });
    });

    it('should not emit for non-sortable column', () => {
      const spy = vi.fn();
      component.sorted.subscribe(spy);

      const column: TableColumn = { key: 'id', label: 'ID' };
      component.onSort(column);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should emit page change', () => {
      fixture.componentRef.setInput('totalItems', 50);
      fixture.componentRef.setInput('pageSize', 10);
      const spy = vi.fn();
      component.pageChanged.subscribe(spy);

      component.onPageChange(3);
      expect(spy).toHaveBeenCalledWith({ page: 3 });
    });

    it('should not emit for invalid page', () => {
      fixture.componentRef.setInput('totalItems', 50);
      fixture.componentRef.setInput('pageSize', 10);
      const spy = vi.fn();
      component.pageChanged.subscribe(spy);

      component.onPageChange(0);
      expect(spy).not.toHaveBeenCalled();

      component.onPageChange(100);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit for current page', () => {
      fixture.componentRef.setInput('totalItems', 50);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('currentPage', 2);
      const spy = vi.fn();
      component.pageChanged.subscribe(spy);

      component.onPageChange(2);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onAction', () => {
    it('should emit action with item', () => {
      const spy = vi.fn();
      component.actionClicked.subscribe(spy);

      const item = { id: 1, name: 'Test' };
      component.onAction('edit', item);
      expect(spy).toHaveBeenCalledWith({ action: 'edit', item });
    });
  });

  describe('getCellValue', () => {
    it('should get simple value', () => {
      const item = { name: 'John' };
      const column: TableColumn = { key: 'name', label: 'Name' };
      expect(component.getCellValue(item, column)).toBe('John');
    });

    it('should get nested value', () => {
      const item = { user: { name: 'John' } } as unknown as Record<string, unknown>;
      const column: TableColumn = { key: 'user.name', label: 'Name' };
      expect(component.getCellValue(item, column)).toBe('John');
    });

    it('should apply format function', () => {
      const item = { is_active: true };
      const column: TableColumn = {
        key: 'is_active',
        label: 'Status',
        format: (v) => (v ? 'Active' : 'Inactive'),
      };
      expect(component.getCellValue(item, column)).toBe('Active');
    });

    it('should return undefined for missing key', () => {
      const item = { name: 'John' };
      const column: TableColumn = { key: 'email', label: 'Email' };
      expect(component.getCellValue(item, column)).toBeUndefined();
    });
  });
});
