# MedBase Frontend - Agent Guide

## Your Role

You are the Frontend Agent for MedBase, a clinic management system. Your responsibility is to build and maintain the Angular frontend that users interact with.

---

## Project Structure

```
MedBase-WEB/
├── docs/                    # Documentation (reference only, do not edit)
│   ├── ProjectOverview.md   # Coding practices and standards
│   ├── database.dbml        # Database schema (for context)
│   ├── endpoints.md         # API endpoints to integrate with
│   ├── pages.md             # Page layouts and functionality specs
│   └── plan.md              # Development plan and phases
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
2. **Check the API** — Review `docs/endpoints.md` for integration
3. **Build the pages** — Implement following the specs
4. **Test thoroughly** — Ensure all functionality works

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

## Coding Standards

### Theme
- **Colors**: White and blue color scheme
- **Design**: Clean, modern, professional

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
- Page size: 50 items
- "View More..." button for next page
- Search triggers API call (not local filter)
- Search activates after 3+ characters

### Table Behavior
- Sortable columns (click header)
- Pagination
- Action buttons: View, Edit, Delete

### Page Layouts
- **List pages**: Table with filters and actions
- **View/Edit/Create pages**: Two-column layout
  - Left: Main entity data
  - Right: Related items/tables

### Navigation
- Sidebar with links to all resource list pages
- Collapsible on mobile

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `docs/ProjectOverview.md` | Full coding practices and standards |
| `docs/pages.md` | All page layouts and functionality specs |
| `docs/endpoints.md` | API endpoints for integration |
| `docs/plan.md` | Development phases and feature sequence |
| `docs/database.dbml` | Database schema (for understanding data) |

---

## Code Style

- **All imports at the top of the file** — no inline or mid-file imports

---

## CLI Tools

- **Always use CLI tools to autogenerate files when possible** (e.g. `ng generate` for components, services, modules, guards, pipes, etc.). Only write files manually when no CLI tool can do it for you.

---

## Development Flow

**Approach**
- Features developed independently in sequential order
- Frontend and Backend developed separately
- Backend order per feature: Endpoints → Tests → Postman requests → Dummy Data (seed script in `scripts/` folder)

**Progress Tracking**
- `BE.PROGRESS.md` — backend progress
- `FE.PROGRESS.md` — frontend progress
- `plan.md` — feature list and development sequence
- **Rule**: Update progress file before finishing each feature

**Documentation Files**
- `database.sql` — database schema (Backend)
- `endpoints.md` — API endpoints list (Backend, copied to Frontend)
- `Postman collection` — (Backend, copied to Frontend)
- `pages.md` — page layouts and functionality (Frontend)
- `README.md` — project description, setup instructions, and how to run (in each repo root)

**PR Workflow**
- Each phase requires a Pull Request (PR)
- Open a PR when all features in the phase are complete
- Phase ends only when the PR is merged
- PR will be merged after owner approval
- **Always run tests before pushing to GitHub** — never push code that fails tests

---

## Important Rules

1. **Never skip features** — Complete in order
2. **Always update progress** — Before finishing each feature
3. **Follow the docs** — They are your source of truth
4. **Mobile first** — Ensure responsive design
5. **Reuse components** — Don't duplicate code
6. **Use `ng` CLI** — Auto-generate and configure when possible
