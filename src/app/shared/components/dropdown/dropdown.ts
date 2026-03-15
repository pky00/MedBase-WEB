import { Component, effect, ElementRef, forwardRef, HostListener, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: unknown;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  label = input('');
  placeholder = input('Select...');
  options = input<DropdownOption[]>([]);
  required = input(false);
  errorMessage = input('');
  hasMore = input(false);
  loading = input(false);

  loadMore = output<void>();
  searchChanged = output<string>();

  isOpen = signal(false);
  searchText = signal('');
  selectedLabel = signal('');
  isDisabled = signal(false);

  private value: unknown = null;
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    // Re-resolve selected label when options change (fixes autofill on edit pages)
    effect(() => {
      const opts = this.options();
      if (this.value != null && !this.selectedLabel()) {
        const option = opts.find((o) => o.value === this.value);
        if (option) {
          this.selectedLabel.set(option.label);
        }
      }
    });
  }

  writeValue(value: unknown): void {
    this.value = value;
    const option = this.options().find((o) => o.value === value);
    this.selectedLabel.set(option?.label ?? '');
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      this.searchText.set('');
    }
  }

  select(option: DropdownOption): void {
    this.value = option.value;
    this.selectedLabel.set(option.label);
    this.onChange(option.value);
    this.onTouched();
    this.isOpen.set(false);
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.selectedLabel.set('');
    this.onChange(null);
  }

  onSearch(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.searchText.set(text);
    if (text.length >= 3 || text.length === 0) {
      this.searchChanged.emit(text);
    }
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
