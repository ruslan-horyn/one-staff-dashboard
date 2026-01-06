# Login - Requirements Analysis

**Generated:** 2026-01-06
**Source:** ui-architecture.md Section 2.1, prd.md US-001

## View Overview

| Attribute     | Value                                      |
|---------------|-------------------------------------------|
| Path          | `/login`                                  |
| Route Group   | `(auth)`                                  |
| Purpose       | Authenticate user to access dashboard     |
| Auth Required | No (public route)                         |
| Roles         | N/A (pre-authentication)                  |

## Data Requirements

### Input (Form Fields)

| Field    | Type     | Required | Validation                    |
|----------|----------|----------|-------------------------------|
| email    | email    | Yes      | Valid email format            |
| password | password | Yes      | Min 8 characters (per schema) |

### Output

| Data           | Source        | Type          |
|----------------|---------------|---------------|
| User session   | Supabase Auth | AuthResponse  |
| Error messages | Server Action | ActionError   |

### URL State

| Param    | Purpose                 | Default     |
|----------|-------------------------|-------------|
| redirect | Post-login destination  | `/` (Board) |

## Components

### Existing (Reuse)

| Component | Location                    | Notes            |
|-----------|-----------------------------|------------------|
| Button    | `components/ui/button`      | shadcn/ui        |
| Input     | `components/ui/input`       | shadcn/ui        |
| Label     | `components/ui/label`       | shadcn/ui        |
| Card      | `components/ui/card`        | shadcn/ui        |
| Alert     | `components/ui/alert`       | For server errors|
| Skeleton  | `components/ui/skeleton`    | Loading state    |

### New (Create)

| Component       | Type   | Location                                        |
|-----------------|--------|------------------------------------------------|
| LoginForm       | Client | `app/(auth)/login/_components/LoginForm.tsx`   |
| PasswordInput   | Client | `components/ui/password-input.tsx` (shared)    |
| SubmitButton    | Client | `components/ui/submit-button.tsx` (shared)     |

## Server Actions

### Existing (Ready to Use)

| Action    | Module | Input Schema    | Notes                    |
|-----------|--------|-----------------|--------------------------|
| signIn    | auth   | signInSchema    | Email + password login   |

### New Required

None - all required actions exist in `services/auth/actions.ts`

## User Story Mapping

### US-001: System Login

**As a** user (Administrator or Coordinator)
**I want to** securely log into the system
**So that** I can access the panel

**Acceptance Criteria:**

- [x] Login page with email and password fields
- [x] Redirect to Board after successful login
- [x] Error message for invalid credentials
- [x] Link to password reset (forgot-password)

## Accessibility Requirements

### Form Accessibility

- [ ] Labels associated with inputs via `htmlFor`
- [ ] `aria-required="true"` on required fields
- [ ] `aria-invalid` when field has error
- [ ] `aria-describedby` linking field to error message

### Keyboard Navigation

- [ ] Tab order: email → password → submit → forgot password link
- [ ] Enter submits form from any field
- [ ] Focus visible on all interactive elements

### Screen Reader

- [ ] Form has accessible name
- [ ] Error messages announced via `aria-live`

## Security Requirements

- [x] No auth required (public page)
- [x] Rate limiting via Supabase Auth (built-in)
- [x] Generic error message (don't reveal if email exists)
- [x] Password field uses `type="password"`
- [x] HTTPS enforced (Vercel - automatic)

## UX Requirements (from ui-architecture.md)

- [ ] Real-time field validation (on blur)
- [ ] Loading spinner during submission
- [ ] Autofocus on email field
- [ ] Redirect to Board on success
- [ ] Password visibility toggle

## Edge Cases

| Case                    | Expected Behavior                       |
|-------------------------|-----------------------------------------|
| Invalid email format    | Show inline error below field           |
| Wrong credentials       | Show generic error "Invalid credentials"|
| Network error           | Show error with retry option            |
| Already logged in       | Redirect to Board                       |
| Password < 8 chars      | Show inline validation error            |

## Open Questions - Resolved

| Question                          | Decision              |
|-----------------------------------|-----------------------|
| Card wrapper?                     | Yes - use Card        |
| Server error display?             | Alert below form      |
| Branding?                         | Placeholder for logo  |
