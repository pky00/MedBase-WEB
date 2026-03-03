import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed on onClose', () => {
    const spy = vi.fn();
    component.closed.subscribe(spy);

    component.onClose();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit closed on backdrop click', () => {
    const spy = vi.fn();
    component.closed.subscribe(spy);

    const mockEvent = {
      target: { classList: { contains: (cls: string) => cls === 'modal-backdrop' } },
    } as unknown as Event;

    component.onBackdropClick(mockEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit closed when clicking inside modal', () => {
    const spy = vi.fn();
    component.closed.subscribe(spy);

    const mockEvent = {
      target: { classList: { contains: () => false } },
    } as unknown as Event;

    component.onBackdropClick(mockEvent);
    expect(spy).not.toHaveBeenCalled();
  });
});
