# Register - Requirements Analysis

**Generated:** 2026-01-11
**Source:** prd.md US-001, server-actions-plan.md (signUp)

## View Overview

| Attribute     | Value                                           |
|---------------|-------------------------------------------------|
| Path          | `/register`                                     |
| Route Group   | `(auth)`                                        |
| Purpose       | Register new organization and administrator     |
| Auth Required | No (public route)                               |
| Roles         | N/A (pre-authentication)                        |

## User Flow

| Action        | Redirect To         | Notes                                    |
|---------------|---------------------|------------------------------------------|
| Success       | `/` (Dashboard)     | Auto-login after registration            |
| Cancel/Back   | `/login`            | Link back to login page                  |
| Related Links | `/login`            | "Already have an account?" link          |

## Data Requirements

### Input (Form Fields)

| Field            | Type     | Required | Validation                          |
|------------------|----------|----------|-------------------------------------|
| organizationName | text     | Yes      | 1-255 characters                    |
| firstName        | text     | Yes      | 1-100 characters                    |
| lastName         | text     | Yes      | 1-100 characters                    |
| email            | email    | Yes      | Valid email format                  |
| password         | password | Yes      | Min 8 characters                    |
| confirmPassword  | password | Yes      | Must match password                 |

### Output

| Data           | Source        | Type          |
|----------------|---------------|---------------|
| User session   | Supabase Auth | AuthResponse  |
| Error messages | Server Action | ActionError   |

### URL State

None required for this view.

## Components

### Existing (Reuse)

| Component      | Location                      | Notes                    |
|----------------|-------------------------------|--------------------------|
| Button         | `components/ui/button`        | shadcn/ui                |
| Input          | `components/ui/input`         | shadcn/ui                |
| Card           | `components/ui/card`          | shadcn/ui                |
| Alert          | `components/ui/alert`         | For server errors        |
| Form           | `components/ui/form`          | react-hook-form wrapper  |
| PasswordInput  | `components/ui/password-input`| Password with toggle     |

### New (Create)

| Component      | Type   | Location                                           |
|----------------|--------|---------------------------------------------------|
| RegisterForm   | Client | `app/(auth)/register/_components/RegisterForm.tsx` |
| useSignUpForm  | Hook   | `app/(auth)/register/_hooks/useSignUpForm.ts`      |
| useSignUpServerAction | Hook | `app/(auth)/register/_hooks/useSignUpServerAction.ts` |

## Server Actions

### Existing (Ready to Use)

| Action   | Module | Input Schema   | Notes                                |
|----------|--------|----------------|--------------------------------------|
| signUp   | auth   | signUpSchema   | Creates organization + user profile  |

### Schema Extension Required

Need to extend signUpSchema with confirmPassword field (client-side only):

```typescript
// Client-side schema extends server schema
const registerFormSchema = signUpSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## User Story Mapping

### US-001: Organization Registration

**As a** new user
**I want to** register my organization
**So that** I can start using the system as an Administrator

**Acceptance Criteria:**

- [x] Registration page accessible from login page
- [x] Form requires: organization name, email, password, first name, last name
- [x] After success, new organization created and user becomes Administrator
- [x] User automatically logged in and redirected to Board
- [x] Error message if email already registered

## Accessibility Requirements

### Form Accessibility

- [ ] Labels associated with inputs via `htmlFor`
- [ ] `aria-required="true"` on required fields
- [ ] `aria-invalid` when field has error
- [ ] `aria-describedby` linking field to error message
- [ ] Form sections grouped logically

### Keyboard Navigation

- [ ] Tab order: orgName -> firstName -> lastName -> email -> password -> confirmPassword -> submit
- [ ] Enter submits form from any field
- [ ] Focus visible on all interactive elements

### Screen Reader

- [ ] Form has accessible name
- [ ] Error messages announced via `aria-live`
- [ ] Field groupings announced

## Security Requirements

- [x] No auth required (public page)
- [x] Rate limiting via Supabase Auth (built-in)
- [x] Password field uses `type="password"`
- [x] Duplicate email returns specific error
- [x] HTTPS enforced (Vercel - automatic)

## UX Requirements

- [ ] Real-time field validation (on blur)
- [ ] Loading spinner during submission
- [ ] Autofocus on organization name field
- [ ] Auto-login and redirect to Board on success
- [ ] Password visibility toggle for both password fields
- [ ] Password match validation in real-time
- [ ] Clear error messages for each field

## Edge Cases

| Case                      | Expected Behavior                          |
|---------------------------|--------------------------------------------|
| Email already registered  | Show "Email already exists" error          |
| Passwords don't match     | Show inline error under confirmPassword    |
| Invalid email format      | Show inline error below field              |
| Password < 8 chars        | Show inline validation error               |
| Network error             | Show error with retry option               |
| Already logged in         | Redirect to Board                          |
| Empty organization name   | Show "Organization name is required"       |

## Open Questions - Resolved

| Question                          | Decision                           |
|-----------------------------------|------------------------------------|
| Password confirmation?            | Yes - two fields                   |
| Success redirect?                 | Auto-login -> Dashboard            |
| Card wrapper?                     | Yes - same as login                |
| Server error display?             | Alert below form                   |
