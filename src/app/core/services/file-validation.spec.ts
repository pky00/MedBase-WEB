import { TestBed } from '@angular/core/testing';

import { FileValidationService } from './file-validation';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should accept valid PDF file', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    expect(service.validate(file)).toEqual({ valid: true });
  });

  it('should accept valid JPEG file', () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    expect(service.validate(file)).toEqual({ valid: true });
  });

  it('should accept valid PNG file', () => {
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    expect(service.validate(file)).toEqual({ valid: true });
  });

  it('should reject invalid file type', () => {
    const file = new File(['content'], 'script.exe', { type: 'application/octet-stream' });
    const result = service.validate(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject file exceeding 5MB', () => {
    const content = new ArrayBuffer(6 * 1024 * 1024);
    const file = new File([content], 'large.pdf', { type: 'application/pdf' });
    const result = service.validate(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5MB');
  });

  it('should accept file at exactly 5MB', () => {
    const content = new ArrayBuffer(5 * 1024 * 1024);
    const file = new File([content], 'exact.pdf', { type: 'application/pdf' });
    expect(service.validate(file)).toEqual({ valid: true });
  });

  it('should accept file by extension when MIME type is empty', () => {
    const file = new File(['content'], 'doc.pdf', { type: '' });
    // File constructor with empty type - extension check should catch it
    const result = service.validate(file);
    expect(result.valid).toBe(true);
  });
});
