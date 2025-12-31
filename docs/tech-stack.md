# One Staff Dashboard - Tech Stack

### Frontend - Next.js with React for Interactive Components

- Next.js 16 (app router) with focus on server-side routing
- React 19 for interactive components
- TypeScript 5 for better code quality and IDE support
- Tailwind CSS 4 for rapid styling
- Zustand for application state management
- Lucide React (application icons)

### Backend - Next.js with Supabase as Comprehensive Backend Solution

- Built-in user authentication based on JWT and Supabase Auth
- PostgreSQL database powered by Supabase

### CI/CD and Hosting

- GitHub Actions for creating CI/CD pipelines
- Cloudflare Pages for hosting - workflow `master.yml`

### Testing

- Unit tests - Vitest with React Testing Library for UI components:

  - Vitest as a modern and fast test runner optimized for Vite/Next
  - React Testing Library for testing interactive React components
  - @testing-library/dom for testing static Next components
  - MSW (Mock Service Worker) for mocking API in tests

- End-to-end tests - Playwright:

  - Simulation of complete user paths with better cross-browser support
  - Testing key functionalities: rule creator, file-based rule generation, collection management
  - Automatic test execution within GitHub Actions CI/CD pipeline

- Code formatting and linting

  - Biome for linting and formatting (replaces ESLint + Prettier)

- Dependencies: `package.json`
