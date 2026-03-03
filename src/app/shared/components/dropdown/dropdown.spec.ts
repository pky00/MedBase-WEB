import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent, DropdownOption } from './dropdown';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle open state', () => {
    expect(component.isOpen()).toBe(false);
    component.toggle();
    expect(component.isOpen()).toBe(true);
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should not toggle when disabled', () => {
    component.setDisabledState(true);
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should clear search text when opening', () => {
    component.searchText.set('test');
    component.toggle();
    expect(component.searchText()).toBe('');
  });

  it('should select an option', () => {
    const changeFn = vi.fn();
    const touchFn = vi.fn();
    component.registerOnChange(changeFn);
    component.registerOnTouched(touchFn);

    const option: DropdownOption = { value: 1, label: 'Option 1' };
    component.select(option);

    expect(component.selectedLabel()).toBe('Option 1');
    expect(changeFn).toHaveBeenCalledWith(1);
    expect(touchFn).toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
  });

  it('should clear selection', () => {
    const changeFn = vi.fn();
    component.registerOnChange(changeFn);

    component.select({ value: 1, label: 'Opt' });
    component.clear({ stopPropagation: vi.fn() } as unknown as Event);

    expect(component.selectedLabel()).toBe('');
    expect(changeFn).toHaveBeenLastCalledWith(null);
  });

  it('should write value and find matching label', () => {
    fixture.componentRef.setInput('options', [
      { value: 1, label: 'First' },
      { value: 2, label: 'Second' },
    ]);
    fixture.detectChanges();

    component.writeValue(2);
    expect(component.selectedLabel()).toBe('Second');
  });

  it('should emit searchChanged on search with 3+ chars', () => {
    const spy = vi.fn();
    component.searchChanged.subscribe(spy);

    component.onSearch({ target: { value: 'ab' } } as unknown as Event);
    expect(spy).not.toHaveBeenCalled();

    component.onSearch({ target: { value: 'abc' } } as unknown as Event);
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('should emit searchChanged when search is cleared', () => {
    const spy = vi.fn();
    component.searchChanged.subscribe(spy);

    component.onSearch({ target: { value: '' } } as unknown as Event);
    expect(spy).toHaveBeenCalledWith('');
  });

  it('should emit loadMore on onLoadMore', () => {
    const spy = vi.fn();
    component.loadMore.subscribe(spy);

    component.onLoadMore();
    expect(spy).toHaveBeenCalled();
  });

  it('should close on outside click', () => {
    component.isOpen.set(true);
    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);

    component.onDocumentClick({ target: outsideEl } as unknown as Event);
    expect(component.isOpen()).toBe(false);

    document.body.removeChild(outsideEl);
  });
});
