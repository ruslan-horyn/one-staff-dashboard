# Password Reset - Requirements Analysis

## Source Documents
- **prd.md:** US-012 (Password Reset)
- **server-actions-plan.md:** Auth Module - `resetPassword`, `updatePassword` actions
- **db-plan.md:** N/A (uses Supabase Auth)

## Views Overview

This feature requires **two separate views**:

### View 1: Forgot Password (`/forgot-password`)

| Attribute | Value |
|-----------|-------|
| Path | `/forgot-password` |
| Route Group | `(auth)` |
| Purpose | Request password reset email |
| Auth Required | No |

### View 2: Reset Password (`/reset-password`)

| Attribute | Value |
|-----------|-------|
| Path | `/reset-password` |
| Route Group | `(auth)` |
| Purpose | Set new password (from email link) |
| Auth Required | Yes (token from email link creates session) |

---

## User Story: US-012

**Title:** Password Reset

**Description:** As a user, I want to reset my password when I forget it so that I can regain access to the system.

**Acceptance Criteria:**
1. On the login page, there is a "Forgot password" link
2. Clicking the link leads to a form with an email field
3. After submitting, a message is displayed (without revealing whether the email exists in the system)
4. User receives an email with a link to set a new password
5. The link leads to a form for setting a new password
6. After setting the password, user is redirected to the login page

---

## User Flow

### Forgot Password Flow

| Action | Redirect To | Notes |
|--------|-------------|-------|
| Submit email | Stay on page | Show success message regardless of email existence |
| Click "Back to login" | `/login` | Link below form |
| Already authenticated | `/` | Redirect away from page |

### Reset Password Flow

| Action | Redirect To | Notes |
|--------|-------------|-------|
| Submit new password | `/login` | With success toast/message |
| Invalid/expired token | `/forgot-password` | With error message |
| Already authenticated | `/` | Redirect away (session exists) |

### Related Links

| From | To | Link Text |
|------|-----|-----------|
| `/login` | `/forgot-password` | "Forgot password?" |
| `/forgot-password` | `/login` | "Back to login" |
| `/reset-password` | `/login` | Auto-redirect after success |

---

## Data Requirements

### Forgot Password View
- [ ] Email address (input)
- [ ] Success/error message state

### Reset Password View
- [ ] New password (input)
- [ ] Confirm password (input) - optional, depends on UX decision
- [ ] Token from URL (handled by Supabase callback)
- [ ] Success/error message state

---

## User Interactions

### Forgot Password View
- [ ] Enter email address
- [ ] Submit form
- [ ] See success message (always shown for security)
- [ ] Navigate back to login

### Reset Password View
- [ ] Enter new password
- [ ] (Optional) Confirm new password
- [ ] Submit form
- [ ] See success notification
- [ ] Redirect to login page

---

## Components Identified

### Forgot Password View

| Component | Type | Status |
|-----------|------|--------|
| `ForgotPasswordForm` | Client | New |
| `Card`, `CardHeader`, `CardContent` | Server | Existing |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | Client | Existing |
| `Input` | Client | Existing |
| `SubmitButton` | Client | Existing |
| `Alert`, `AlertDescription` | Client | Existing |

### Reset Password View

| Component | Type | Status |
|-----------|------|--------|
| `ResetPasswordForm` | Client | New |
| `Card`, `CardHeader`, `CardContent` | Server | Existing |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | Client | Existing |
| `PasswordInput` | Client | Existing |
| `SubmitButton` | Client | Existing |
| `Alert`, `AlertDescription` | Client | Existing |

---

## Server Actions Required

### Already Implemented

- [x] `resetPassword` - Sends password reset email via Supabase Auth
  - Input: `{ email: string }`
  - Output: `{ success: true }` (always returns success for security)
  - Auth: `requireAuth: false`

- [x] `updatePassword` - Updates user password
  - Input: `{ newPassword: string }`
  - Output: `{ success: true }`
  - Auth: `requireAuth: true` (user must be authenticated via reset link)

### Schemas Already Defined

- [x] `resetPasswordSchema` - `z.object({ email: z.email() })`
- [x] `updatePasswordSchema` - `z.object({ newPassword: z.string().min(8) })`

---

## Hooks Required

### New Hooks to Create

| Hook | Purpose | Pattern |
|------|---------|---------|
| `useForgotPasswordForm` | Initialize react-hook-form with resetPasswordSchema | Like `useSignInForm` |
| `useForgotPasswordServerAction` | Handle resetPassword action with success state | Like `useSignInServerAction` |
| `useResetPasswordForm` | Initialize react-hook-form with updatePasswordSchema | Like `useSignInForm` |
| `useResetPasswordServerAction` | Handle updatePassword action with redirect | Like `useSignInServerAction` |

---

## Accessibility Requirements

### Forgot Password View
- [ ] Focus on email input on page load
- [ ] Clear error message on input change
- [ ] `aria-invalid` on email field when validation fails
- [ ] `role="alert"` for success/error messages
- [ ] Keyboard navigation: Tab through form, Enter to submit

### Reset Password View
- [ ] Focus on password input on page load
- [ ] Show/hide password toggle accessible (`aria-label`)
- [ ] Password requirements visible (via `FormDescription`)
- [ ] `aria-invalid` on password field when validation fails
- [ ] `role="alert"` for error messages
- [ ] Keyboard navigation: Tab through form, Enter to submit

---

## Security Considerations

- [ ] **Email enumeration prevention**: Always show success message after forgot-password submission
- [ ] **Token handling**: Supabase handles token verification via auth callback
- [ ] **Password requirements**: Minimum 8 characters (enforced by Zod schema)
- [ ] **Session handling**: User gets authenticated via Supabase magic link callback
- [ ] **Rate limiting**: Handled by Supabase Auth (`over_request_rate_limit` error)
- [ ] **Redirect protection**: Verify redirect URLs are internal

---

## Supabase Auth Flow

### Password Reset Process

1. User submits email on `/forgot-password`
2. `resetPassword` action calls `supabase.auth.resetPasswordForEmail(email)`
3. Supabase sends email with magic link containing token
4. User clicks link, Supabase redirects to callback URL
5. Callback URL (configured in Supabase): `{SITE_URL}/auth/callback?type=recovery`
6. Callback route exchanges token for session
7. User is redirected to `/reset-password` with active session
8. User enters new password
9. `updatePassword` action calls `supabase.auth.updateUser({ password })`
10. User is redirected to `/login` with success message

### Required Configuration
- [ ] Verify Supabase email templates are configured
- [ ] Verify redirect URL is set in Supabase project settings
- [ ] Auth callback route at `/auth/callback` or `/api/auth/callback`

---

## Edge Cases

1. **Expired token**: User clicks old/expired reset link
   - Show error message, redirect to forgot-password

2. **Already logged in**: Authenticated user visits forgot-password
   - Redirect to dashboard/home

3. **Rate limited**: Too many reset requests
   - Show "Too many requests" error

4. **Invalid email format**: Client-side validation catches this
   - Show inline validation error

5. **Weak password**: Password doesn't meet requirements
   - Show validation error with requirements

---

## Open Questions

1. **Password confirmation field**: Should reset-password form have "confirm password" field?
   - Recommendation: Yes, for better UX (prevents typos)
   - Alternative: No, keep form simple with show/hide toggle

2. **Success message on forgot-password**: Inline message or toast?
   - Recommendation: Inline message (more visible, stays on screen)

3. **Auth callback route**: Does `/auth/callback` or `/api/auth/callback` exist?
   - Need to verify existing implementation
