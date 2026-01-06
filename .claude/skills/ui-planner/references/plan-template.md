# Implementation Plan Template

Complete template for Stage 3: Plan Generation with examples.

## File Structure Template

```markdown
# [View Name] - Implementation Plan

**Generated:** YYYY-MM-DD
**Based on:** 01-requirements.md, 02-design-decisions.md

## File Structure

\`\`\`
app/
└── ([route-group])/
    └── [view-path]/
        ├── page.tsx           # Server Component - main page
        ├── loading.tsx        # Loading skeleton
        ├── error.tsx          # Error boundary (optional)
        └── _components/       # View-specific components
            ├── [Component1].tsx
            └── [Component2].tsx

components/
└── [shared-component]/        # If reusable across views
    └── [Component].tsx

services/
└── [module]/
    ├── actions.ts             # Server Actions
    └── schemas.ts             # Zod schemas
\`\`\`

## Implementation Order

Priority order for implementation:

1. [ ] **Schema** - Define Zod validation schemas
2. [ ] **Server Actions** - Implement data fetching/mutations
3. [ ] **Page Component** - Create main page.tsx
4. [ ] **Form/Table Components** - Build main interactive elements
5. [ ] **Supporting Components** - Add remaining UI pieces
6. [ ] **Loading State** - Create loading.tsx skeleton
7. [ ] **Error Handling** - Add error boundaries if needed
8. [ ] **Tests** - Write unit/integration tests

## Component Specifications

### [ComponentName]

| Property | Value |
|----------|-------|
| File | `app/(...)/view/_components/ComponentName.tsx` |
| Type | Client Component |
| Purpose | Brief description |

**Props Interface:**
\`\`\`typescript
interface ComponentNameProps {
  initialData?: DataType;
  onSuccess?: () => void;
  onCancel?: () => void;
}
\`\`\`

**Internal State:**
\`\`\`typescript
// Form state via react-hook-form
const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});

// Server action state via useServerAction
const { execute, isPending } = useServerAction(action);
\`\`\`

**Key Behaviors:**
- Behavior 1
- Behavior 2

**Dependencies:**
- `@/services/module/schemas` - validation schema
- `@/services/module/actions` - server actions
- `@/components/ui/button` - shadcn button
- `react-hook-form` - form handling

---

## Server Actions

### [actionName]

| Property | Value |
|----------|-------|
| File | `services/[module]/actions.ts` |
| Auth | Required / Not required |
| Roles | All / Admin only |

**Input Schema:**
\`\`\`typescript
// services/[module]/schemas.ts
export const actionInputSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.string().email('Invalid email'),
});

export type ActionInput = z.infer<typeof actionInputSchema>;
\`\`\`

**Implementation:**
\`\`\`typescript
// services/[module]/actions.ts
'use server';

import { createAction } from '@/services/shared';
import { actionInputSchema, type ActionInput } from './schemas';

export const actionName = createAction<ActionInput, ReturnType>(
  async (input, { supabase, user }) => {
    // Implementation
    const { data, error } = await supabase
      .from('table')
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: actionInputSchema }
);
\`\`\`

**Return Type:**
\`\`\`typescript
type ReturnType = {
  id: string;
  // ... fields
};
\`\`\`

**Error Cases:**
| Error Code | Trigger | User Message |
|------------|---------|--------------|
| VALIDATION_ERROR | Invalid input | Field-specific errors |
| NOT_FOUND | Resource missing | "Not found" |
| DUPLICATE_ENTRY | Unique constraint | "Already exists" |

---

## Page Component

### page.tsx

\`\`\`typescript
// app/([group])/view/page.tsx
import { Metadata } from 'next';
import { ComponentName } from './_components/ComponentName';

export const metadata: Metadata = {
  title: 'Page Title | One Staff Dashboard',
  description: 'Page description',
};

export default function ViewPage() {
  return (
    <div className="container py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
      </header>

      <main>
        <ComponentName />
      </main>
    </div>
  );
}
\`\`\`

### loading.tsx

\`\`\`typescript
// app/([group])/view/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container py-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
\`\`\`

---

## Testing Checklist

### Unit Tests

\`\`\`typescript
// __tests__/components/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ComponentName />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('submits valid data', async () => {
    const onSuccess = vi.fn();
    render(<ComponentName onSuccess={onSuccess} />);
    // ... fill form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSuccess).toHaveBeenCalled();
  });
});
\`\`\`

### Integration Tests

\`\`\`typescript
// __tests__/integration/view.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ViewPage from '../page';

describe('View Page', () => {
  it('loads and displays data', async () => {
    render(<ViewPage />);
    await waitFor(() => {
      expect(screen.getByText(/expected content/i)).toBeInTheDocument();
    });
  });
});
\`\`\`

### Accessibility Tests

- [ ] axe-core scan passes
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus management correct
- [ ] Color contrast meets WCAG AA

---

## Implementation Notes

### Code Patterns to Follow

**Form with react-hook-form:**
\`\`\`typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useServerAction } from '@/hooks/useServerAction';
import { schema, type Input } from '@/services/module/schemas';
import { action } from '@/services/module/actions';

export const FormComponent = () => {
  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { field: '' },
  });

  const { execute, isPending } = useServerAction(action, {
    onSuccess: () => {
      toast.success('Success');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    execute(data);
  });

  return (
    <form onSubmit={onSubmit}>
      {/* form fields */}
    </form>
  );
};
\`\`\`

**Server Action result handling:**
\`\`\`typescript
import { isSuccess, isFailure } from '@/services/shared';

const result = await action(input);

if (isSuccess(result)) {
  // result.data available
} else {
  // result.error.code, result.error.message available
}
\`\`\`

### Common Pitfalls to Avoid

1. **Missing 'use client'** - Add to all components using hooks
2. **Form without loading state** - Always disable submit during pending
3. **Missing error handling** - Always handle Server Action errors
4. **Hardcoded text** - Prepare for i18n even in MVP
5. **Missing accessibility** - Add ARIA attributes from the start
6. **URL state not synced** - Use URL params for filters/pagination

### Dependencies to Check

Before implementing, verify these are installed:
- [ ] `react-hook-form` - form handling
- [ ] `@hookform/resolvers` - zod integration
- [ ] `zod` - validation
- [ ] `sonner` - toast notifications
- [ ] Required shadcn/ui components

---

## Handoff Checklist

Before marking plan as complete:

- [ ] All components specified with props interfaces
- [ ] All Server Actions defined with schemas
- [ ] File structure is clear and follows project conventions
- [ ] Implementation order is logical
- [ ] Dependencies are identified
- [ ] Testing approach is defined
- [ ] Accessibility requirements are addressed
- [ ] No open questions remaining
\`\`\`
