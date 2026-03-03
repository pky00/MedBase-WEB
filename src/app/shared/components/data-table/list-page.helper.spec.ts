import { signal } from '@angular/core';

import { ListPageHelper } from './list-page.helper';

describe('ListPageHelper', () => {
  let helper: ListPageHelper;

  beforeEach(() => {
    helper = new ListPageHelper();
  });

  it('should initialize with defaults', () => {
    expect(helper.loading()).toBe(false);
    expect(helper.totalItems()).toBe(0);
    expect(helper.currentPage()).toBe(1);
    expect(helper.sortColumn()).toBe('id');
    expect(helper.sortOrder()).toBe('asc');
    expect(helper.pageSize).toBe(10);
  });

  it('should accept custom defaults', () => {
    const custom = new ListPageHelper(25, 'name');
    expect(custom.pageSize).toBe(25);
    expect(custom.sortColumn()).toBe('name');
  });

  describe('onSort', () => {
    it('should update sort column and order', () => {
      helper.onSort({ column: 'name', order: 'desc' });
      expect(helper.sortColumn()).toBe('name');
      expect(helper.sortOrder()).toBe('desc');
    });
  });

  describe('onPageChange', () => {
    it('should update current page', () => {
      helper.onPageChange({ page: 3 });
      expect(helper.currentPage()).toBe(3);
    });
  });

  describe('onFilterChange', () => {
    it('should update filter signal and reset page to 1', () => {
      helper.currentPage.set(5);
      const filterSignal = signal('');
      const event = { target: { value: 'admin' } } as unknown as Event;

      helper.onFilterChange(filterSignal, event);

      expect(filterSignal()).toBe('admin');
      expect(helper.currentPage()).toBe(1);
    });
  });
});
