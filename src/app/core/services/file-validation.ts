import { Injectable } from '@angular/core';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@Injectable({
  providedIn: 'root',
})
export class FileValidationService {
  validate(file: File): FileValidationResult {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: PDF, JPEG, PNG.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
      };
    }

    return { valid: true };
  }
}
