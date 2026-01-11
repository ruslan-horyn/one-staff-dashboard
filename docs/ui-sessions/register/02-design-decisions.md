# Register - Design Decisions

**Generated:** 2026-01-11
**Based on:** 01-requirements.md, existing login patterns

## Component Choices

### RegisterForm (Client Component)

- **Pattern:** Follows existing `LoginForm` structure
- **Form library:** react-hook-form with zodResolver
- **Reasoning:** Consistent with existing auth forms, proven pattern

### Form Layout

- **Structure:** Single column form with logical groupings
- **Groupings:**
  1. Organization section (name)
  2. Personal info section (firstName, lastName)
  3. Account section (email)
  4. Security section (password, confirmPassword)
- **Reasoning:** Reduces cognitive load, groups related fields

## Layout Structure

### Desktop/Tablet/Mobile

- **Same as login:** Centered card, max-width 400px (wider than login due to more fields)
- **Reasoning:** Consistent auth experience
- **Responsive:** Single column works for all breakpoints

```
┌────────────────────────────────────────┐
│  [Logo] One Staff Dashboard            │
│  Create your organization              │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ Organization name                  │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ My Company                   │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ ┌──────────────┐ ┌──────────────┐  │ │
│ │ │ First name   │ │ Last name    │  │ │
│ │ └──────────────┘ └──────────────┘  │ │
│ │                                    │ │
│ │ Email                              │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ name@example.com             │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ Password                           │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ ••••••••            [👁]    │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ Confirm password                   │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ ••••••••            [👁]    │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │       Create account         │   │ │
│ │ └──────────────────────────────┘   │ │
│ └────────────────────────────────────┘ │
│                                        │
│    Already have an account? Sign in    │
└────────────────────────────────────────┘
```

## Form Handling

### Library
- **react-hook-form** with **zodResolver**
- Consistent with login and other project forms

### Validation Strategy
- **Mode:** `onBlur` - validates when field loses focus
- **Password confirmation:** Custom refine() with real-time check
- **Server errors:** Displayed in Alert component below form

### Schema Extension

```typescript
// app/(auth)/register/_hooks/useSignUpForm.ts
import { z } from 'zod';
import { signUpSchema } from '@/services/auth/schemas';

export const registerFormSchema = signUpSchema.extend({
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
```

### Error Display
- **Field errors:** Inline below each field (FormMessage)
- **Server errors:** Alert component below submit button
- **Error mapping:** Use existing error codes from ActionError

## Accessibility Implementation

| Requirement          | Implementation                                    |
|----------------------|---------------------------------------------------|
| Labels               | `<FormLabel>` from shadcn/ui Form                |
| Required fields      | `aria-required="true"` via FormField             |
| Invalid state        | `aria-invalid` managed by Form component         |
| Error association    | `aria-describedby` via FormMessage               |
| Focus management     | Autofocus on first field (organizationName)      |
| Keyboard nav         | Native form behavior + Enter to submit           |

## State Management

- **Form state:** react-hook-form (local)
- **Server action state:** useServerAction hook (local)
- **No global state needed** - self-contained auth flow

## Error Handling

### Client-Side Errors

| Field            | Possible Errors                         |
|------------------|-----------------------------------------|
| organizationName | Required, max 255 chars                 |
| firstName        | Required, max 100 chars                 |
| lastName         | Required, max 100 chars                 |
| email            | Required, invalid format                |
| password         | Required, min 8 chars                   |
| confirmPassword  | Required, min 8 chars, doesn't match    |

### Server-Side Errors

| Error Code       | Display Message                         |
|------------------|-----------------------------------------|
| DUPLICATE_ENTRY  | "An account with this email already exists" |
| VALIDATION_ERROR | Field-specific error from details       |
| INTERNAL_ERROR   | "Something went wrong. Please try again." |

## Visual Design

### Consistent with Login

- Same Card component
- Same logo/branding area
- Same color scheme
- Same input/button styles

### Differences from Login

- Wider max-width (400px vs 384px) for name fields row
- More vertical space for additional fields
- Name fields in 2-column grid on desktop

## Hook Structure

Following existing login pattern with SOLID principles:

```
app/(auth)/register/
├── _hooks/
│   ├── useSignUpForm.ts         # Form setup + schema
│   └── useSignUpServerAction.ts # Server action wrapper
└── _components/
    └── RegisterForm.tsx         # Form UI
```

## Related Links

| Link Text                    | Destination   |
|------------------------------|---------------|
| "Already have an account?"   | `/login`      |
| "Sign in"                    | `/login`      |
