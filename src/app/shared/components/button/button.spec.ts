import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant of primary', () => {
    expect(component.variant()).toBe('primary');
  });

  it('should have default type of button', () => {
    expect(component.type()).toBe('button');
  });

  it('should emit clicked when onClick is called', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    component.onClick();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit when loading', () => {
    fixture.componentRef.setInput('loading', true);
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });
});
