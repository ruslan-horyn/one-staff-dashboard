# Landing Page + Waitlista (#1a) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy landing page at "/" with email waitlist form backed by Supabase, and privacy policy at "/privacy" — accessible to unauthenticated users — all within the existing Next.js repo.

**Architecture:** New `(marketing)` route group with its own minimal layout (no app-shell). Proxy updated to whitelist "/" and "/privacy". Waitlist submissions handled by a server action writing to `waitlist_subscribers` table (anon INSERT via RLS). `WaitlistForm` is a permanent, style-agnostic component; LP section components are placeholder/throwaway and will be replaced in #1b.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (PostgreSQL + RLS), Zod, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-04-14-landing-page-waitlist-design.md`

> **Dokumentacja zewnętrznych narzędzi:** Przed implementacją kroków korzystających z Supabase JS client, Next.js App Router lub innych bibliotek — pobierz aktualną dokumentację przez context7 MCP (`mcp__context7__resolve-library-id` + `mcp__context7__query-docs`). Nie polegaj na wiedzy z treningu — API się zmienia.

---

## File Structure

**New files:**
- `supabase/migrations/20260414000000_create_waitlist_subscribers.sql`
- `services/waitlist/schemas.ts`
- `services/waitlist/actions.ts`
- `app/(marketing)/layout.tsx`
- `app/(marketing)/landing.css` — CSS from HTML generator, copied as-is
- `app/(marketing)/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `components/marketing/WaitlistForm.tsx`
- `components/marketing/HeroSection.tsx`
- `components/marketing/FeaturesSection.tsx`
- `components/marketing/CtaSection.tsx`
- `components/marketing/Footer.tsx`
- `__tests__/services/waitlist/actions.test.ts`
- `__tests__/components/marketing/WaitlistForm.test.tsx`

**Modified files:**
- `lib/supabase/proxy.ts` — add public path whitelist for "/" and "/privacy"

---

## Task 1: Supabase migration — waitlist_subscribers

**Files:**
- Create: `supabase/migrations/20260414000000_create_waitlist_subscribers.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260414000000_create_waitlist_subscribers.sql
create table waitlist_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text,
  created_at  timestamptz default now()
);

alter table waitlist_subscribers enable row level security;

create policy "anon can insert waitlist subscribers"
  on waitlist_subscribers
  for insert
  to anon
  with check (true);

create policy "authenticated can read waitlist subscribers"
  on waitlist_subscribers
  for select
  to authenticated
  using (true);
```

- [ ] **Step 2: Apply migration locally**

```bash
pnpm supabase migration up
```

Expected: migration applied, no errors.

- [ ] **Step 3: Verify table in Supabase Studio**

Open Supabase Studio (check local URL in `.env.local` or `docker-compose.yml`).
Go to Table Editor → confirm `waitlist_subscribers` exists with columns: `id`, `email`, `source`, `created_at`.
Go to Authentication → Policies → confirm two policies on `waitlist_subscribers`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260414000000_create_waitlist_subscribers.sql
git commit -m "feat(db): add waitlist_subscribers table with RLS"
```

---

## Task 2: Waitlist service — schema + server action (TDD)

**Files:**
- Create: `services/waitlist/schemas.ts`
- Create: `services/waitlist/actions.ts`
- Create: `__tests__/services/waitlist/actions.test.ts`

- [ ] **Step 1: Read existing service patterns**

Read these files before writing anything:
- `services/clients/schemas.ts` — pattern for Zod schemas
- `services/clients/actions.ts` — pattern for server actions
- `lib/supabase/server.ts` — how to instantiate the Supabase client (note: is `createClient` sync or async?)
- `services/shared/index.ts` — check `ActionResult` type definition

- [ ] **Step 2: Write the failing tests**

```typescript
// __tests__/services/waitlist/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { subscribeToWaitlist } from '@/services/waitlist/actions'
import { createClient } from '@/lib/supabase/server'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockSupabase = { from: mockFrom }

beforeEach(() => {
  // createClient may be sync or async depending on implementation —
  // if sync, change mockResolvedValue to mockReturnValue
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  mockFrom.mockReturnValue({ insert: mockInsert })
})

describe('subscribeToWaitlist', () => {
  it('inserts email and returns success', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const result = await subscribeToWaitlist({ email: 'test@example.com', source: 'hero' })

    expect(mockFrom).toHaveBeenCalledWith('waitlist_subscribers')
    expect(mockInsert).toHaveBeenCalledWith({ email: 'test@example.com', source: 'hero' })
    expect(result).toEqual({ success: true, data: { email: 'test@example.com' } })
  })

  it('returns success silently for duplicate email', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } })

    const result = await subscribeToWaitlist({ email: 'dupe@example.com' })

    expect(result).toEqual({ success: true, data: { email: 'dupe@example.com' } })
  })

  it('returns validation error for invalid email', async () => {
    const result = await subscribeToWaitlist({ email: 'not-an-email' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns database error for unexpected failures', async () => {
    mockInsert.mockResolvedValue({ error: { code: '500', message: 'unexpected error' } })

    const result = await subscribeToWaitlist({ email: 'test@example.com' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'DATABASE_ERROR' },
    })
  })
})
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
pnpm test __tests__/services/waitlist/actions.test.ts
```

Expected: FAIL — "Cannot find module '@/services/waitlist/actions'"

- [ ] **Step 4: Create schema**

```typescript
// services/waitlist/schemas.ts
import { z } from 'zod'

export const subscribeToWaitlistSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  source: z.string().optional(),
})

export type SubscribeToWaitlistInput = z.infer<typeof subscribeToWaitlistSchema>
```

- [ ] **Step 5: Create server action**

Note: if `createClient` in `lib/supabase/server.ts` is sync (not async), remove `await` below.

```typescript
// services/waitlist/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { subscribeToWaitlistSchema } from './schemas'
import type { ActionResult } from '@/services/shared'

export async function subscribeToWaitlist(
  input: unknown
): Promise<ActionResult<{ email: string }>> {
  const parsed = subscribeToWaitlistSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane',
      },
    }
  }

  const { email, source } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('waitlist_subscribers')
    .insert({ email, source })

  if (error?.code === '23505') {
    return { success: true, data: { email } }
  }

  if (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Nie udało się zapisać. Spróbuj ponownie.',
      },
    }
  }

  return { success: true, data: { email } }
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
pnpm test __tests__/services/waitlist/actions.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add services/waitlist/schemas.ts services/waitlist/actions.ts __tests__/services/waitlist/actions.test.ts
git commit -m "feat(waitlist): add subscribeToWaitlist server action with TDD"
```

---

## Task 3: Proxy — whitelist public marketing routes

**Files:**
- Modify: `lib/supabase/proxy.ts`

- [ ] **Step 1: Read the current proxy implementation**

Read `lib/supabase/proxy.ts` in full before making any changes. Identify:
- Where the redirect to `/login` happens for unauthenticated users
- Where the redirect to `/dashboard` happens for authenticated users on auth pages

- [ ] **Step 2: Add public paths whitelist**

At the top of `updateSession()`, before any Supabase client initialization, add:

```typescript
const PUBLIC_PATHS = ['/', '/privacy']

// Inside updateSession(), as the very first thing:
const pathname = request.nextUrl.pathname

if (PUBLIC_PATHS.includes(pathname)) {
  return NextResponse.next()
}
```

Use exact match (`includes` on array with `===` semantics), not `startsWith`, to avoid accidentally exposing `/dashboard` or other routes.

- [ ] **Step 3: Start dev server and verify**

```bash
pnpm dev
```

Test in a fresh incognito window:
- `http://localhost:5100/` → page loads (even without login) ✓
- `http://localhost:5100/privacy` → page loads (even without login) ✓
- `http://localhost:5100/dashboard` → redirects to `/login` ✓
- `http://localhost:5100/workers` → redirects to `/login` ✓

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/proxy.ts
git commit -m "feat(auth): whitelist public marketing routes in proxy"
```

---

## Task 4: WaitlistForm component (TDD)

**Files:**
- Create: `components/marketing/WaitlistForm.tsx`
- Create: `__tests__/components/marketing/WaitlistForm.test.tsx`

- [ ] **Step 1: Write failing component tests**

```typescript
// __tests__/components/marketing/WaitlistForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'

vi.mock('@/services/waitlist/actions', () => ({
  subscribeToWaitlist: vi.fn(),
}))

import { subscribeToWaitlist } from '@/services/waitlist/actions'

describe('WaitlistForm', () => {
  it('renders email input and submit button', () => {
    render(<WaitlistForm />)
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zapisz się/i })).toBeInTheDocument()
  })

  it('renders privacy notice with link to /privacy', () => {
    render(<WaitlistForm />)
    expect(screen.getByRole('link', { name: /polityką prywatności/i }))
      .toHaveAttribute('href', '/privacy')
  })

  it('shows success message after successful submission', async () => {
    vi.mocked(subscribeToWaitlist).mockResolvedValue({
      success: true,
      data: { email: 'test@example.com' },
    })

    render(<WaitlistForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }))

    await waitFor(() => {
      expect(screen.getByText(/zapisano/i)).toBeInTheDocument()
    })
  })

  it('shows success message for duplicate email (silent)', async () => {
    vi.mocked(subscribeToWaitlist).mockResolvedValue({
      success: true,
      data: { email: 'dupe@example.com' },
    })

    render(<WaitlistForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'dupe@example.com')
    await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }))

    await waitFor(() => {
      expect(screen.getByText(/zapisano/i)).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    vi.mocked(subscribeToWaitlist).mockResolvedValue({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Nie udało się zapisać. Spróbuj ponownie.' },
    })

    render(<WaitlistForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }))

    await waitFor(() => {
      expect(screen.getByText(/nie udało się/i)).toBeInTheDocument()
    })
  })

  it('disables button while submitting', async () => {
    vi.mocked(subscribeToWaitlist).mockImplementation(
      () => new Promise(resolve =>
        setTimeout(() => resolve({ success: true, data: { email: 'test@example.com' } }), 100)
      )
    )

    render(<WaitlistForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }))

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test __tests__/components/marketing/WaitlistForm.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/marketing/WaitlistForm'"

- [ ] **Step 3: Implement WaitlistForm**

```typescript
// components/marketing/WaitlistForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { subscribeToWaitlist } from '@/services/waitlist/actions'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface WaitlistFormProps {
  source?: string
  className?: string
}

export const WaitlistForm = ({ source = 'form', className }: WaitlistFormProps) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const result = await subscribeToWaitlist({ email, source })

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(result.error.message)
    }
  }

  if (status === 'success') {
    return (
      <p className={className}>
        Zapisano! Damy Ci znać, gdy ruszymy.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="waitlist-email" className="sr-only">
        Email
      </label>
      <input
        id="waitlist-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="twoj@email.com"
        required
        aria-label="email"
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Zapisywanie...' : 'Zapisz się'}
      </button>
      {status === 'error' && (
        <p role="alert">{errorMessage}</p>
      )}
      <p>
        Twoje dane przetwarzamy zgodnie z{' '}
        <Link href="/privacy">Polityką prywatności</Link>.
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test __tests__/components/marketing/WaitlistForm.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add components/marketing/WaitlistForm.tsx __tests__/components/marketing/WaitlistForm.test.tsx
git commit -m "feat(marketing): add WaitlistForm component with TDD"
```

---

## Task 5: Marketing layout + CSS

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `app/(marketing)/landing.css`

- [ ] **Step 1: Copy CSS from HTML generator**

```bash
cp /Users/ruslanhoryn/Projects/layout-generator/projects/one_staff_dashboard/landing-page/style_050_rounded_symm_v4/styles.css "app/(marketing)/landing.css"
```

- [ ] **Step 2: Check if script.js has needed functionality**

```bash
cat /Users/ruslanhoryn/Projects/layout-generator/projects/one_staff_dashboard/landing-page/style_050_rounded_symm_v4/script.js
```

If script.js is non-empty (e.g., mobile menu toggle, scroll events): copy it to `public/landing-script.js` and include via Next.js `<Script>` in layout (see Step 3 variant).

- [ ] **Step 3: Create marketing layout**

Variant A — no script needed:
```typescript
// app/(marketing)/layout.tsx
import type { Metadata } from 'next'
import './landing.css'

export const metadata: Metadata = {
  title: 'One Staff Dashboard — zarządzaj pracownikami tymczasowymi bez Excela',
  description:
    'Centralne źródło prawdy dla agencji pracy tymczasowej. Zarządzaj pracownikami, klientami i przypisaniami w jednym miejscu.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Variant B — script needed:
```typescript
// app/(marketing)/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './landing.css'

export const metadata: Metadata = {
  title: 'One Staff Dashboard — zarządzaj pracownikami tymczasowymi bez Excela',
  description:
    'Centralne źródło prawdy dla agencji pracy tymczasowej. Zarządzaj pracownikami, klientami i przypisaniami w jednym miejscu.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="/landing-script.js" strategy="afterInteractive" />
    </>
  )
}
```

- [ ] **Step 4: Verify existing app routes unaffected**

```bash
pnpm dev
```

Open http://localhost:5100/dashboard (after logging in) — should still use app-shell layout, not marketing layout. No visual changes to app.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/layout.tsx" "app/(marketing)/landing.css"
git commit -m "feat(marketing): add marketing route group with layout and CSS"
```

---

## Task 6: Landing page sections + main page

**Files:**
- Create: `components/marketing/HeroSection.tsx`
- Create: `components/marketing/FeaturesSection.tsx`
- Create: `components/marketing/CtaSection.tsx`
- Create: `components/marketing/Footer.tsx`
- Create: `app/(marketing)/page.tsx`

- [ ] **Step 1: Open the HTML template**

```bash
cat /Users/ruslanhoryn/Projects/layout-generator/projects/one_staff_dashboard/landing-page/style_050_rounded_symm_v4/index.html
```

Read the full HTML and identify the section boundaries (hero, features, cta, footer).

- [ ] **Step 2: Create HeroSection**

Copy the hero section HTML, convert to JSX (class → className, self-close void elements). Replace any `<form>` or CTA button with `<WaitlistForm source="hero" />`:

```typescript
// components/marketing/HeroSection.tsx
import { WaitlistForm } from './WaitlistForm'

export const HeroSection = () => {
  return (
    <section className="hero">
      {/* Paste converted hero HTML here */}
      {/* Replace <form>...</form> with: */}
      <WaitlistForm source="hero" />
    </section>
  )
}
```

- [ ] **Step 3: Create FeaturesSection**

```typescript
// components/marketing/FeaturesSection.tsx
export const FeaturesSection = () => {
  return (
    <section className="features">
      {/* Paste converted features HTML here */}
    </section>
  )
}
```

- [ ] **Step 4: Create CtaSection with second WaitlistForm**

```typescript
// components/marketing/CtaSection.tsx
import { WaitlistForm } from './WaitlistForm'

export const CtaSection = () => {
  return (
    <section className="cta">
      {/* Paste converted CTA HTML here */}
      <WaitlistForm source="cta_bottom" />
    </section>
  )
}
```

- [ ] **Step 5: Create Footer**

```typescript
// components/marketing/Footer.tsx
export const Footer = () => {
  return (
    <footer className="footer">
      {/* Paste converted footer HTML here */}
      {/* Ensure: link to /privacy and contact email are visible */}
    </footer>
  )
}
```

- [ ] **Step 6: Create main landing page**

```typescript
// app/(marketing)/page.tsx
import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { CtaSection } from '@/components/marketing/CtaSection'
import { Footer } from '@/components/marketing/Footer'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 7: Verify page renders correctly**

Open http://localhost:5100/ in incognito window.
- Page loads without redirect ✓
- WaitlistForm is visible in hero ✓
- Sections match the original HTML template visually ✓
- Mobile view works (resize browser to 375px) ✓

- [ ] **Step 8: Test waitlist form manually end-to-end**

1. Enter a test email → click Zapisz się
2. Check Supabase Studio → `waitlist_subscribers` → row with that email ✓
3. Submit the same email again → "Zapisano!" shown (silent duplicate) ✓

- [ ] **Step 9: Commit**

```bash
git add components/marketing/ "app/(marketing)/page.tsx"
git commit -m "feat(marketing): add landing page sections and main page"
```

---

## Task 7: Privacy policy page

**Files:**
- Create: `app/(marketing)/privacy/page.tsx`

- [ ] **Step 1: Create privacy policy**

```typescript
// app/(marketing)/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Polityka prywatności — One Staff Dashboard',
}

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
      <Link href="/">← Wróć na stronę główną</Link>

      <h1>Polityka prywatności</h1>
      <p><strong>Ostatnia aktualizacja:</strong> 14 kwietnia 2026</p>

      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest:{' '}
        <strong>[WPISZ: Twoje imię i nazwisko lub nazwa firmy]</strong>,{' '}
        email: <strong>[WPISZ: twoj@email.com]</strong>.
      </p>

      <h2>2. Jakie dane zbieramy</h2>
      <p>
        Zbieramy wyłącznie adres email podany dobrowolnie w formularzu
        zapisu na listę oczekujących (waitlistę).
      </p>

      <h2>3. Cel i podstawa przetwarzania</h2>
      <p>
        Adres email przetwarzamy w celu poinformowania Cię o uruchomieniu
        aplikacji One Staff Dashboard. Podstawą prawną jest Twoja zgoda
        (art. 6 ust. 1 lit. a RODO).
      </p>

      <h2>4. Czas przechowywania danych</h2>
      <p>
        Dane przechowujemy do momentu uruchomienia produktu lub do czasu
        wycofania przez Ciebie zgody, w zależności od tego, co nastąpi
        wcześniej.
      </p>

      <h2>5. Twoje prawa</h2>
      <p>
        Masz prawo dostępu do danych, ich sprostowania, usunięcia,
        ograniczenia przetwarzania oraz przenoszenia.
      </p>

      <h2>6. Jak usunąć swoje dane</h2>
      <p>
        Napisz na <strong>[WPISZ: twoj@email.com]</strong> — usuniemy
        Twój adres email w ciągu 72 godzin.
      </p>

      <h2>7. Pliki cookies</h2>
      <p>
        Strona nie używa plików cookies śledzących ani narzędzi
        analitycznych zbierających dane osobowe.
      </p>
    </main>
  )
}
```

**Przed deployem:** zastąp oba miejsca `[WPISZ: ...]` swoimi danymi.

- [ ] **Step 2: Verify privacy page loads without auth**

Open http://localhost:5100/privacy in incognito — should load, not redirect.
Click "← Wróć" → should go back to `/`.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/privacy/page.tsx"
git commit -m "feat(marketing): add privacy policy page"
```

---

## Task 8: Final checks

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: all existing tests pass + 10 new tests (4 action tests + 6 WaitlistForm tests).

- [ ] **Step 2: Run linter**

```bash
pnpm lint
```

Fix any issues before continuing.

- [ ] **Step 3: Full smoke test in incognito**

| URL | Expected |
|-----|----------|
| `http://localhost:5100/` | Landing page loads |
| `http://localhost:5100/privacy` | Privacy page loads |
| `http://localhost:5100/dashboard` | Redirect to `/login` |
| `http://localhost:5100/login` | Login page loads |
| Form submit (new email) | "Zapisano!" message |
| Form submit (same email again) | "Zapisano!" message (silent) |
| Form submit (invalid email) | Browser validation blocks submit |
| "Polityką prywatności" link | Opens `/privacy` |
| "← Wróć" on privacy page | Goes back to `/` |

- [ ] **Step 4: Commit fixes if any**

```bash
git commit -m "fix(marketing): address lint and smoke test issues"
```
