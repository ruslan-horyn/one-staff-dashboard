# Login - Requirements Analysis

**Generated:** 2024-01-15
**Source:** ui-architecture.md Section 2.1, prd.md US-001

## View Overview

| Attribute | Value |
|-----------|-------|
| Path | `/login` |
| Route Group | `(auth)` |
| Purpose | Authenticate user to access dashboard |
| Auth Required | No (public route) |
| Roles | N/A (pre-authentication) |

## Data Requirements

### Input (Form Fields)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | email | Yes | Valid email format |
| password | password | Yes | Min 1 character (server validates) |

### Output

| Data | Source | Type |
|------|--------|------|
| User session | Supabase Auth | Session object |
| Error messages | Server Action | ActionError |

### URL State

| Param | Purpose | Default |
|-------|---------|---------|
| redirect | Post-login destination | `/` (Board) |
| error | Error from auth callback | none |

## Components

### Existing (Reuse)

| Component | Location | Notes |
|-----------|----------|-------|
| Button | `components/ui/button` | shadcn/ui |
| Input | `components/ui/input` | shadcn/ui |
| Label | `components/ui/label` | shadcn/ui |
| Card | `components/ui/card` | shadcn/ui (optional wrapper) |

### New (Create)

| Component | Type | Location |
|-----------|------|----------|
| LoginForm | Client | `app/(auth)/login/_components/LoginForm.tsx` |
| PasswordInput | Client | `components/ui/password-input.tsx` (shared) |
| SubmitButton | Client | `components/ui/submit-button.tsx` (shared) |

## Server Actions

### Existing

| Action | Module | Usage |
|--------|--------|-------|
| signIn | auth | Login with email/password |

### New Required

None - `signIn` action already exists in `services/auth/actions.ts`

## User Story Mapping

### US-001: Login

**As a** Coordinator/Admin
**I want to** log in to the system
**So that** I can access the dashboard

**Acceptance Criteria:**
- [x] Login form with email and password fields
- [x] Validation of input fields
- [x] Error messages for invalid credentials
- [x] Redirect to Board on success
- [x] Link to password reset

## Accessibility Requirements

### Form Accessibility
- [ ] Labels associated with inputs via `htmlFor`
- [ ] `aria-required="true"` on required fields
- [ ] `aria-invalid` when field has error
- [ ] `aria-describedby` linking field to error message
- [ ] `aria-live="polite"` for error announcements

### Keyboard Navigation
- [ ] Tab order: email → password → submit → forgot password link
- [ ] Enter submits form from any field
- [ ] Focus visible on all interactive elements

### Screen Reader
- [ ] Form has accessible name
- [ ] Error messages announced
- [ ] Loading state announced

## Security Requirements

- [ ] No auth required (public page)
- [ ] Rate limiting via Supabase Auth
- [ ] Generic error message (don't reveal if email exists)
- [ ] HTTPS enforced (Cloudflare)
- [ ] Password field uses `type="password"`
- [ ] No password in URL or logs

## UX Requirements (from ui-architecture.md)

- [ ] Real-time field validation
- [ ] Loading spinner during submission
- [ ] Autofocus on email field
- [ ] Redirect to Board on success
- [ ] Toast notification on error (optional)

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Invalid email format | Show inline error |
| Wrong credentials | Show generic error "Invalid credentials" |
| Network error | Show error with retry option |
| Already logged in | Redirect to Board |
| Session expired callback | Show message, allow re-login |

## Open Questions

- [x] Should we show "Remember me" checkbox? → **No** (MVP scope)
- [x] Social login (Google, etc.)? → **No** (MVP scope)
- [x] Magic link option? → **No** (MVP scope)
