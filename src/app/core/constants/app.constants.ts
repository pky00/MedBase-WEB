// Storage keys
export const TOKEN_KEY = 'medbase_token';

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USERS_NEW: '/users/new',
  MEDICINE_CATEGORIES: '/medicine-categories',
  EQUIPMENT_CATEGORIES: '/equipment-categories',
  MEDICAL_DEVICE_CATEGORIES: '/medical-device-categories',
  MEDICINES: '/medicines',
  EQUIPMENT: '/equipment',
  MEDICAL_DEVICES: '/medical-devices',
  PARTNERS: '/partners',
  DOCTORS: '/doctors',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  MEDICAL_RECORDS: '/medical-records',
  THIRD_PARTIES: '/third-parties',
} as const;

// Display formatters
export const formatActiveStatus = (value: unknown): string =>
  value ? 'Active' : 'Inactive';

// API endpoints
export const API = {
  AUTH_LOGIN: 'auth/login',
  AUTH_LOGOUT: 'auth/logout',
  AUTH_ME: 'auth/me',
  USERS: 'users',
  MEDICINE_CATEGORIES: 'medicine-categories',
  EQUIPMENT_CATEGORIES: 'equipment-categories',
  MEDICAL_DEVICE_CATEGORIES: 'medical-device-categories',
  MEDICINES: 'medicines',
  EQUIPMENT: 'equipment',
  MEDICAL_DEVICES: 'medical-devices',
  PARTNERS: 'partners',
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  PATIENT_DOCUMENTS: 'patient-documents',
  PATIENT_DOCUMENT_TYPES: 'patient-document-types',
  APPOINTMENTS: 'appointments',
  VITAL_SIGNS: 'vital-signs',
  MEDICAL_RECORDS: 'medical-records',
  THIRD_PARTIES: 'third-parties',
  INVENTORY_TRANSACTIONS: 'inventory-transactions',
  TREATMENTS: 'treatments',
} as const;
