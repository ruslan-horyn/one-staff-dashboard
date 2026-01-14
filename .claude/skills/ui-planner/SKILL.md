---
name: ui-planner
description: This skill should be used when the user asks to "przygotuj ui widoku", "zaplanuj ui dla", "plan ui", "analyze view requirements", "ui planning session", or mentions planning UI views, analyzing view specifications, or preparing implementation plans for frontend components. Supports parallel planning for multiple views.
version: 1.0.0
---

# UI Planner

UI Planner is a planning agent that analyzes view requirements, consults on UX decisions, and generates implementation plans. Run this skill before implementing UI views to ensure thorough preparation.

## Purpose

- Analyze view requirements from `docs/ui-architecture.md` and `docs/prd.md`
- Consult on UX/accessibility decisions using best practices
- Generate structured implementation plans saved to `docs/ui-sessions/`
- Support parallel planning for multiple views simultaneously

## When to Use

Invoke this skill when:

- Starting work on a new UI view
- Planning multiple views at once (e.g., "przygotuj ui dla login i profile")
- Need structured analysis before implementation
- Want UX consultation and decision documentation

## Workflow Stages

### Stage 1: Requirements Analysis

Extract and validate requirements from project documentation:

1. Read `docs/ui-architecture.md` section for the target view
2. Read `docs/prd.md` for related User Stories
3. Identify existing components in codebase that can be reused
4. **Verify User Flow** (if not provided by user)
5. Generate requirements checklist

**Key questions to answer:**

- What data does the view display/collect?
- What user interactions are required?
- What Server Actions are needed?
- What accessibility requirements apply?
- What security considerations exist?

**User Flow Verification (REQUIRED):**

If user flow was not specified, you MUST ask the user about redirections and navigation:

| Flow Type | Question to Ask |
|-----------|-----------------|
| Success redirect | "Where should user be redirected after successful action?" (e.g., after login → `/` or `/dashboard`) |
| Error handling | "Should user stay on page or be redirected on error?" |
| Related pages | "What related pages should link to/from this view?" (e.g., login ↔ forgot-password) |
| Cancel action | "Where should Cancel button lead?" |
| Back navigation | "Is there a specific back navigation target?" |

**Common User Flows:**

| View | Success Redirect | Related Links |
|------|------------------|---------------|
| Login | `/` or `/dashboard` | → forgot-password, → register |
| Register | `/login` (with success message) or auto-login → `/` | → login |
| Forgot Password | `/login` (with email sent message) | → login |
| Reset Password | `/login` (with password changed message) | - |
| Profile Edit | stay or `/profile` | - |
| CRUD Forms | list page (e.g., `/workers`) | → list |

Always document the user flow decisions in `01-requirements.md` under "User Flow" section.

**Route Configuration Verification (REQUIRED):**

Before finalizing requirements, verify the route is properly configured in the proxy/middleware:

1. Check `proxy.ts` (or `middleware.ts`) for `publicRoutes` array
2. For public routes (login, register, etc.) - ensure path is in `publicRoutes`
3. For protected routes - ensure route is NOT in `publicRoutes`

| Route Type | Required in publicRoutes |
|------------|-------------------------|
| /login | Yes |
| /register | Yes |
| /forgot-password | Yes |
| /reset-password | Yes |
| /auth/* | Yes |
| /dashboard/* | No (protected) |
| /workers/* | No (protected) |
| /clients/* | No (protected) |

If the route is missing from `publicRoutes`, add it to the implementation plan as a required step.

### Stage 2: UX Consultation

Analyze design patterns and propose solutions:

1. Review shadcn/ui components applicable to the view
2. Check Tailwind CSS patterns for layout/styling
3. Verify WCAG accessibility compliance
4. Identify potential UX improvements

**Consultation areas:**

- Component selection (which shadcn/ui components to use)
- Layout structure (responsive design approach)
- Form handling (validation, error states, loading states)
- Accessibility (ARIA attributes, keyboard navigation, focus management)
- User feedback (toasts, loading indicators, empty states)

Ask clarifying questions when multiple valid approaches exist.

### Stage 3: Plan Generation

Create structured implementation plan:

1. List all components to create/modify
2. Define file structure and locations
3. Specify props interfaces and types
4. Document state management approach
5. List Server Actions to implement/use

## Output Structure

Save all outputs to `docs/ui-sessions/<view-name>/`:

```
docs/ui-sessions/
└── <view-name>/
    ├── 01-requirements.md      # Stage 1 output
    ├── 02-design-decisions.md  # Stage 2 output
    └── 03-implementation-plan.md # Stage 3 output
```

### File Formats

**01-requirements.md:**

```markdown
# <View Name> - Requirements Analysis

## Source Documents
- ui-architecture.md: Section X.X
- prd.md: US-XXX

## View Overview
| Attribute | Value |
|-----------|-------|
| Path | /path |
| Route Group | (group) |
| Purpose | Description |

## User Flow
| Action | Redirect To | Notes |
|--------|-------------|-------|
| Success | /path | After successful action |
| Cancel | /path | Cancel button destination |
| Related Links | /path | Links to/from this view |

## Data Requirements
- [ ] Data item 1
- [ ] Data item 2

## User Interactions
- [ ] Interaction 1
- [ ] Interaction 2

## Components Identified
| Component | Type | Status |
|-----------|------|--------|
| ComponentName | Client/Server | New/Existing |

## Server Actions Required
- [ ] actionName - description

## Accessibility Requirements
- [ ] ARIA requirement 1
- [ ] Keyboard navigation requirement

## Security Considerations
- [ ] Security item 1
```

**02-design-decisions.md:**

```markdown
# <View Name> - Design Decisions

## Component Choices

### <Component Name>
- **shadcn/ui base:** Button/Input/Dialog/etc.
- **Reasoning:** Why this component
- **Customizations:** What modifications needed

## Layout Structure
- Desktop: description
- Tablet: description
- Mobile: description

## Form Handling
- Library: react-hook-form + zod
- Validation: description
- Error display: description

## Accessibility Implementation
| Requirement | Implementation |
|-------------|----------------|
| ARIA | aria-* attributes |
| Keyboard | Tab order, shortcuts |
| Focus | Focus management approach |

## State Management
- [ ] URL state for: filters, pagination
- [ ] Local state for: form, UI toggles
- [ ] No global state needed / Zustand for: X

## Open Questions
- [ ] Question requiring user decision
```

**03-implementation-plan.md:**

```markdown
# <View Name> - Implementation Plan

## File Structure
```

app/
└── (group)/
    └── view-name/
        ├── page.tsx
        ├── loading.tsx
        └── _components/
            └── ComponentName.tsx

```

## Implementation Order
1. [ ] Step 1 - description
2. [ ] Step 2 - description

## Component Specifications

### ComponentName
- **File:** path/to/file.tsx
- **Type:** Client/Server Component
- **Props:**
  ```typescript
  interface ComponentNameProps {
    prop: type;
  }
  ```

- **Dependencies:** list of imports
- **Notes:** implementation notes

## Server Actions

| Action | File | Input Schema | Return Type |
|--------|------|--------------|-------------|
| actionName | path | SchemaName | ResultType |

## Testing Checklist

- [ ] Unit tests for: components
- [ ] Integration tests for: flows
- [ ] Accessibility tests for: WCAG items

```

## Parallel Execution

When planning multiple views, launch separate planning sessions:

```

User: "przygotuj ui dla login i profile"

Response:

1. Launch Agent 1: ui-planner for "login"
2. Launch Agent 2: ui-planner for "profile"
3. Both agents work in parallel
4. Each generates its own docs/ui-sessions/<view>/ folder

```

Use the Task tool with multiple invocations to run agents in parallel.

## Project Context

### Key Documentation Files
- `docs/ui-architecture.md` - View specifications, components, UX requirements
- `docs/prd.md` - User Stories, acceptance criteria
- `docs/tech-stack.md` - Technology choices
- `CLAUDE.md` - Coding standards, patterns

### Component Library
- **Base:** shadcn/ui components
- **Tables:** @tanstack/react-table
- **Forms:** react-hook-form + zod + @hookform/resolvers
- **Icons:** Lucide React (planned)

### Patterns to Follow
- Server Components by default
- Client Components only when needed (interactivity, hooks)
- URL as source of truth for filters/search
- Server Actions with `createAction()` wrapper
- Zod schemas shared between client and server

### SOLID Principles

Follow SOLID principles in component design:
- **S**ingle Responsibility: Each component/hook has one purpose
- **O**pen/Closed: Use composition over modification
- **L**iskov Substitution: Components should be interchangeable
- **I**nterface Segregation: Props interfaces should be minimal
- **D**ependency Inversion: Depend on abstractions (hooks, actions)

## Pre-Planning Research (REQUIRED)

Before generating plans, explore the codebase for existing utilities:

1. **Existing Types** - Check `types/` folder for relevant types (e.g., `Database`, `UserRole`)
2. **Shared Helpers** - Check `services/shared/` for:
   - `result.ts` - ActionResult, isSuccess, isFailure
   - `pagination.ts` - paginateResult, applyPaginationToQuery
   - `auth.ts` - getSession, requireSession
3. **Existing Hooks** - Check `hooks/` for reusable hooks (e.g., `useServerAction`)
4. **UI Components** - Check `components/ui/` for available shadcn components
5. **Service Patterns** - Check `services/<module>/` for existing action patterns

Document discovered utilities in the implementation plan to ensure ui-builder uses them.

## Additional Resources

### Reference Files
- **`references/analysis-checklist.md`** - Detailed checklist for requirements analysis
- **`references/ux-patterns.md`** - shadcn/ui, Tailwind, WCAG patterns
- **`references/plan-template.md`** - Full template with examples

### Example Sessions
- **`examples/login-session/`** - Complete planning session for Login view

## Quick Start

To plan a single view:
```

"przygotuj ui widoku login"

```

To plan multiple views in parallel:
```

"przygotuj ui dla login, profile i forgot-password"

```

After planning, implement in a separate session:
```

"zaimplementuj widok login" (uses ui-builder skill)

```
