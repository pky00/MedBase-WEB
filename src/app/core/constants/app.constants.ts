// Storage keys
export const TOKEN_KEY = 'medbase_token';

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USERS_NEW: '/users/new',
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
  THIRD_PARTIES: 'third-parties',
} as const;
