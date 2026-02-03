# CLAUDE.md - AI Assistant Context Document

## User Preferences

- **User knows React but NOT Angular** - explain Angular concepts when relevant
- **Do NOT ask permission to edit files** - proceed with implementation directly
- **Keep docs in sync** - when updating `.cursorrules`, always update `CLAUDE.md` with the same changes, and vice versa

## Authentication & Routing

- **All pages require authentication EXCEPT the login page**
- Unauthenticated users are redirected to `/login`
- After successful login, users are redirected to the dashboard
- Use Angular route guards (`canActivate`) to protect routes
- Store JWT token in localStorage
- Include token in all API requests via HTTP interceptor

## API Backend Modifications

- **The MedBase-API may not support all features** needed by the frontend
- **ALWAYS verify that backend endpoints support the functionality** before implementing frontend features
- Check the API backend (../MedBase-API) to ensure endpoints exist and support required parameters (sorting, filtering, etc.)
- **Do NOT ask permission to edit files in the project** - proceed with implementation directly
- If backend changes are needed, implement them in the API codebase first, then update the frontend

## Angular CLI Usage

- **Use Angular CLI to generate** components, services, guards, interceptors, and other artifacts
- **The assistant CAN run ng generate commands** when needed (no need to ask user to run them)
- Use appropriate flags: `--skip-tests` if tests aren't needed, `--flat` for single files
- After running CLI commands, modify the generated files as needed
- **Do NOT run `ng serve` or `ng test`** - the user will run these manually when ready

## Project Overview

**MedBase-WEB** is an Angular frontend for the **MedBase-API** backend. MedBase is a clinic management system designed for a **free clinic** with these characteristics:

- **Does NOT charge patients** (no billing, invoicing, or payments)
- **Relies on donations** for medicine, equipment, and medical devices
- **No in-house laboratory** (patients upload external lab results as documents)
- **All system users are admins** with full access (no role-based permissions)

## Technology Stack

- **Framework**: Angular 21+ (standalone components, signals)
- **Styling**: SCSS (SASS)
- **Color Theme**: Blue and White
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with interceptors
- **Forms**: Reactive Forms
- **Routing**: Angular Router with lazy loading

## API Backend Connection

The frontend connects to **MedBase-API** (FastAPI backend):

| Environment | API URL |
|-------------|---------|
| Local Development | `http://localhost:8000/api/v1` |
| Production | Configure in `src/environments/environment.ts` |

### Authentication
- JWT token-based authentication
- Login endpoint: `POST /api/v1/auth/login`
- Token included in `Authorization: Bearer <token>` header
- Default admin credentials: `admin` / `admin`

## Development Commands

```bash
# Start development server (local API)
ng serve

# Build for production
ng build --configuration=production

# Run tests
ng test

# Run linting
ng lint
```

## Design Theme

### Color Palette (Blue & White)

```scss
// Primary Colors
$primary-blue: #1976D2;          // Main brand color
$primary-blue-dark: #1565C0;     // Hover states
$primary-blue-light: #42A5F5;    // Accents

// Background Colors
$background-white: #FFFFFF;       // Main background
$background-light: #F5F7FA;       // Secondary background
$background-blue-tint: #E3F2FD;   // Subtle blue background

// Text Colors
$text-primary: #212121;           // Main text
$text-secondary: #757575;         // Secondary text
$text-on-primary: #FFFFFF;        // Text on blue backgrounds

// Status Colors
$success: #4CAF50;
$warning: #FF9800;
$error: #F44336;
$info: #2196F3;

// Border Colors
$border-light: #E0E0E0;
$border-blue: #90CAF9;
```

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Define interfaces for all API responses and requests

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators (default in Angular v20+)
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use `@HostBinding` and `@HostListener` decorators - use `host` object in decorator instead
- Use `NgOptimizedImage` for all static images (not for base64 images)

## Accessibility Requirements

- MUST pass all AXE checks
- MUST follow all WCAG AA minimums:
  - Focus management
  - Color contrast (4.5:1 for normal text, 3:1 for large text)
  - ARIA attributes
  - Keyboard navigation
- All form inputs must have associated labels
- All images must have alt text
- All interactive elements must be focusable

## Component Guidelines

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like `new Date()` are available in templates
- Do not write arrow functions in templates (they are not supported)

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   └── guards/
│   │       └── auth.guard.ts
│   ├── shared/                  # Reusable components, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/                # Feature modules (lazy loaded)
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── prescriptions/
│   │   ├── inventory/
│   │   │   ├── medicines/
│   │   │   ├── medical-devices/
│   │   │   └── equipment/
│   │   └── donations/
│   │       ├── donors/
│   │       └── donations/
│   ├── layouts/                 # Layout components
│   │   └── main-layout/
│   ├── app.ts
│   ├── app.routes.ts
│   └── app.config.ts
├── environments/
│   ├── environment.ts           # Production config
│   └── environment.development.ts # Local development config
├── styles/
│   ├── _variables.scss          # SCSS variables (colors, spacing)
│   ├── _mixins.scss             # SCSS mixins
│   └── _typography.scss         # Typography styles
└── styles.scss                  # Global styles
```

## Domain Rules - CRITICAL

### Never Implement
- Billing, invoicing, or payment features
- Price calculations or financial transactions
- Role-based access control (all users are admins)
- In-house laboratory management
- Complex scheduling (departments, rooms)

### Always Remember
- **Donations are central**: Medicine, equipment, and medical devices come from donors
- **Medical devices vs Equipment**:
  - `medical_devices` = Prescribable to patients (wheelchairs, walkers, braces)
  - `equipment` = Clinic use only (monitors, surgical tools)
- **Doctors can be from donors**: A doctor may be sponsored by a donor organization
- **Lab results are documents**: External lab results uploaded as patient_documents

## API Entities

| Entity | Description |
|--------|-------------|
| Users | System administrators |
| Patients | Patient demographics, allergies, medical history |
| Doctors | Medical staff (can be linked to donors) |
| Appointments | Patient-doctor appointments |
| Prescriptions | Medicine and device prescriptions |
| Medicines | Medicine catalog and inventory |
| Medical Devices | Prescribable devices (wheelchairs, etc.) |
| Equipment | Clinic equipment (not prescribed) |
| Donors | Donation sources |
| Donations | Donation records |

## What Needs to Be Built

### Core Setup (Priority)
- [x] Angular project created
- [ ] Environment configuration (local/production)
- [ ] SCSS theme variables
- [ ] Auth service and interceptor
- [ ] Auth guard
- [ ] Main layout (header, sidebar, content)

### Features (Priority Order)
1. **Authentication** - Login page, token management
2. **Dashboard** - Overview/home page after login
3. **Patients** - CRUD operations
4. **Doctors** - CRUD operations
5. **Appointments** - Scheduling and management
6. **Prescriptions** - Medicine and device prescriptions
7. **Inventory** - Medicines, medical devices, equipment
8. **Donations** - Donors and donation tracking

## Important Notes for AI Assistants

1. **This is a FREE clinic** - never add billing/payment features
2. **No lab functionality** - lab results are document uploads only
3. **All users are admins** - no role-based access control
4. **Blue & White theme** - maintain consistent color scheme
5. **Donations are critical** - medicine, equipment, and medical devices come from donors
6. **Medical devices are prescribable** - unlike equipment which is for clinic use only
7. **Angular 21+** - use modern Angular patterns (signals, standalone components, control flow)
8. **SCSS** - use variables and mixins for consistent styling
9. **Accessibility** - all components must be WCAG AA compliant
10. **Keep docs in sync** - When updating `.cursorrules`, also update `CLAUDE.md`
