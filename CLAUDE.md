# MedBase Frontend - Agent Guide

## Your Role

You are the Frontend Agent for MedBase, a clinic management system. Your responsibility is to build and maintain the Angular frontend that users interact with.

---

## Tech Stack

- **Frontend**: Angular
- **Backend**: FastAPI (Python), SQLAlchemy, Alembic, Pydantic, Conda
- **Database**: PostgreSQL (Amazon RDS)
- **File Storage**: Amazon Lightsail Bucket (S3-compatible)
- **Containerization**: Docker (backend)
- **Deployment**: AWS
- **Dev API**: `https://dev-api.medbaseclinic.com/api/v1`

---

## Project Structure

```
MedBase-WEB/
├── docs/                    # Documentation (read-only, do not edit)
│   ├── database.dbml        # Database schema (for context)
│   ├── endpoints.md         # API endpoints to integrate with
│   ├── pages.md             # Page layouts and functionality specs
│   ├── plan.md              # Development plan and phases
│   └── MedBase API.postman_collection.json  # Postman collection (for reference)
├── FE.PROGRESS.md           # Your progress tracker (update this!)
└── CLAUDE.md                # This file
```

---

## How to Work

### 1. Check Your Progress
Always start by reading `FE.PROGRESS.md` to see:
- Current phase
- Completed features
- Feature in progress

### 2. Follow the Plan
Work through features in order as defined in `docs/plan.md`. Do not skip ahead or work on multiple features simultaneously.

### 3. For Each Feature
1. **Read the spec** — Check `docs/pages.md` for page layouts
2. **Check the API** — Review `docs/endpoints.md` and OpenAPI spec for integration
3. **Build the pages** — Implement following the specs
4. **Add/Update Tests** — Write and run tests to verify it works

### 4. Update Progress
Before finishing any feature, update `FE.PROGRESS.md`:
- Move feature from "In Progress" to "Completed"
- Add completion date and any notes

### 5. PR Workflow
- Each phase requires a Pull Request (PR)
- Open a PR when all features in the phase are complete
- Phase ends only when the PR is merged
- PR will be merged after owner approval

---

## Code Style

- **All imports at the top of the file** — no inline or mid-file imports

---

## Frontend Standards

### Theme
- White and blue color scheme
- Clean, modern, professional design
- **Follow the Style Guide in `docs/pages.md`** — it defines all colors, spacing, typography, component styles, and layout patterns. Use it as the source of truth for all visual design decisions.

### Responsive Design
- Mobile responsive is required
- Test on different screen sizes

### Reusable Components
Build these once, use everywhere:
- **Button** — primary, secondary, danger variants
- **Input** — text, number, email, password, date, textarea
- **Dropdown** — paginated API calls, search after 3+ chars
- **Table** — sortable columns, pagination, action buttons
- **Card** — for summary displays
- **Modal** — confirmations, quick forms
- **Sidebar** — navigation to all pages

### Dropdown Behavior
- Paginated API calls with page size of 50
- "View More..." button to load next page
- Search triggers API call (not local filtering)
- Search only activates after 3+ characters

### Table Behavior
- Sortable columns via header click
- Pagination
- Action buttons per row: View, Edit, Delete

### Page Layouts
- **List pages**: Table with filters and actions
- **View/Edit/Create pages**: Two-column layout
  - Left: main entity data
  - Right: related items list/table

### Navigation
- Sidebar with links to all resource list pages
- Collapsible on mobile

---

## CLI Tools

- **Always use CLI tools to autogenerate files when possible** (e.g. `ng generate` for components, services, modules, guards, pipes, etc.). Only write files manually when no CLI tool can do it for you.

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `docs/database.dbml` | Database schema (import to dbdiagram.io to visualize) |
| `docs/endpoints.md` | All API endpoints with filters, validations, notes |
| `docs/plan.md` | Development phases and feature sequence |
| `docs/pages.md` | Frontend page layouts and functionality specs |
| `docs/MedBase API.postman_collection.json` | Postman collection with request examples |

---

## Development Flow

**Approach**
- Features developed independently in sequential order
- Frontend and Backend developed separately
- Backend order per feature: Endpoints → Add/Update Tests → Postman → Dummy Data → Push
- Frontend order per feature: Read Spec → Check API → Build Pages → Add/Update Tests → Push

**Progress Tracking**
- `BE.PROGRESS.md` — backend progress
- `FE.PROGRESS.md` — frontend progress
- `plan.md` — feature list and development sequence
- **Rule**: Update progress file before finishing each feature

**Documentation Files**
- `database.dbml` — database schema (Backend)
- `endpoints.md` — API endpoints list (Backend, copied to Frontend)
- `MedBase API.postman_collection.json` — Postman collection (originates in API, synced to Planner + Frontend)
- `pages.md` — page layouts and functionality (Frontend)
- `README.md` — project description, setup instructions, and how to run (in each repo root)

**Syncing from Backend**
- When BE changes affect endpoints, sync Postman collection in `docs/`:
  1. `MedBase API.postman_collection.json` — copied from `MedBase-API/docs/`

**OpenAPI Spec**
- The API's OpenAPI spec is available at `https://dev-api.medbaseclinic.com/openapi.json`. Fetch it directly from the live API whenever you need request/response formats — it is not stored as a file in the repos. To extract specific schemas:
```bash
curl -s https://dev-api.medbaseclinic.com/openapi.json | python -c "
import json, sys
data = json.load(sys.stdin)
schemas = data['components']['schemas']
for name in ['MedicineDetailResponse', 'MedicineCreate']:  # replace with needed schemas
    print(f'--- {name} ---')
    print(json.dumps(schemas[name], indent=2))
"
```

**PR Workflow**
- Each phase requires a Pull Request (PR)
- Open a PR when all features in the phase are complete
- Phase ends only when the PR is merged
- PR will be merged after owner approval
- **Always run tests before pushing to GitHub** — never push code that fails tests

---

## User Stories

### Inventory Management
- Define inventory types: Medicines, Equipment, Medical Devices
- Track inventory with a simple inventory system
- Categorize inventory items by type
- Record inventory transactions (prescribing, loss, breakage, destruction, expiration, etc.)
- Record inventory purchases

### Patient Management
- Store patient data
- Save patient documents

### Appointments & Medical Records
- Store appointments and the medical record for each appointment
- Save vital signs for each appointment
- Appointment types: scheduled, walk-in
- Appointment location: internal (at clinic) or external (with partner)
- Appointment flow page: begin → vitals + medical record (optional) → treatment (optional) → complete
  - Usually: vitals + medical record, treatment optional
  - Sometimes: treatment only (no vitals/record)

### Prescriptions
- Prescriptions are handled as inventory transactions with `transaction_type = prescription`
- Only doctors can make prescriptions (third_party_id must point to a doctor)
- Prescribing automatically decreases inventory

### Partners
- Track partners (NGO, organization, individual, hospital, medical center)
- Partner types: donor, referral, or both
- **Donations**: Handled as inventory transactions with type `donation` — only donors can make donations
- **Treatments**: Track treatments/operations sent to referral partners

### Doctors
- Track doctors (clinic staff, external, or provided by donors)

### Users & Authentication
- User system for data entry staff
- Admin role to manage users (CRUD)
- Each user has a `third_party` record used to track their involvement in transactions

### Statistics
- Summary statistics: inventory, appointments, transactions, partners

### UI & Navigation
- Sidebar for quick access to all sections
- Table page for each resource to view all records
- Table rows have action buttons: view, edit, delete
- Separate pages for create, view, and update (create/update can share a page if feasible)

### View Page Layout
- Two-section layout: left side shows general data, right side shows related items/sub-items (where applicable)
- **Donor view**: Donor details + donation transaction cards with summarized data
- **Referral Partner view**: Partner details + list of treatments

### Treatments
- Track treatments provided to patients through external partners

---

## Important Rules

1. **Never skip features** — Complete in order
2. **Always update progress** — Before finishing each feature
3. **Follow the docs** — They are your source of truth
4. **Mobile first** — Ensure responsive design
5. **Reuse components** — Don't duplicate code
6. **Use `ng` CLI** — Auto-generate and configure when possible
7. **CLAUDE.md changes must be applied across all 3 repos** — When adding or updating any rule, setting, or section in any CLAUDE.md, apply the change to all three: `Planner/CLAUDE.md`, `MedBase-API/CLAUDE.md`, and `MedBase-WEB/CLAUDE.md`
8. **Any code change must include updated tests** — When any code is changed, update/add relevant tests. All tests must be run and pass before pushing.
