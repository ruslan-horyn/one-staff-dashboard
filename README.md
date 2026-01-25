# One Staff Dashboard

Internal MVP web application for a temporary staffing agency, designed to streamline core operations by replacing manual spreadsheet-based processes.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

One Staff Dashboard centralizes management of temporary workers, clients, work locations, and schedules. The application enables coordinators to quickly assign workers to open positions, monitor their workload, and generate key reports on hours worked.

**Key Features:**

- User management with two roles: Administrator and Coordinator
- CRUD operations for Clients, Work Locations, and Temporary Workers
- Worker assignment to positions with start/end datetime tracking
- Main dashboard view with sortable/filterable worker list
- Hours worked reports with CSV/Excel export
- Immutable audit log for all assignment operations

## Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (state management)
- Lucide React (icons)

**Backend:**

- Supabase (PostgreSQL + JWT authentication)

**Testing:**

- Vitest + React Testing Library + MSW (unit tests)
- Playwright (E2E tests)

**CI/CD & Hosting:**

- GitHub Actions
- Vercel

## Getting Started Locally

### Prerequisites

- Node.js v24.11.1 (see `.nvmrc`)
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd one-staff-dashboard

# Use correct Node version (if using nvm)
nvm use

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

| Script        | Description                              |
| ------------- | ---------------------------------------- |
| `pnpm dev`    | Start development server                 |
| `pnpm build`  | Create production build                  |
| `pnpm start`  | Run production server                    |
| `pnpm lint`   | Run ESLint                               |

## Project Scope

### Included in MVP

- Login/logout with username and password
- Client management (Admin only)
- Work Location management linked to Clients (Admin only)
- Temporary Worker management (Coordinator)
- Open Position creation within Work Locations
- Worker assignment with start datetime (end datetime optional)
- "End work" functionality for active assignments
- "Cancel assignment" before start time
- Main dashboard with worker list, sorting, and filtering
- Hours reports with date range selection and CSV/Excel export
- Audit log for assignment operations

### Excluded from MVP

- Automatic data migration from existing systems
- Temporary worker login access
- Automatic notifications (SMS, email)
- Overlap warnings for assignments (coordinator responsibility)
- Advanced analytics beyond basic hours report

## Project Status

**Early Development** - This project is currently in the initial MVP development phase.

## License

This is a private internal application. All rights reserved.
