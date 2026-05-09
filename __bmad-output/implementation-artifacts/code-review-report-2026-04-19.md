---
source_type: 'branch'
source_ref: 'feature/landing-page-waitlist'
target_branch: 'feature/landing-page-waitlist'
review_date: '2026-04-19'
reviewer: 'Adversarial Code Reviewer (Claude)'
files_reviewed: 32
issues_found: 16
critical_count: 7
quality_count: 7
suggestion_count: 2
---

# Code Review: branch — feature/landing-page-waitlist

## Overview

Feature dodaje landing page marketingowy z waitlistą do projektu `one-staff-dashboard`. Zakres zmian: nowa grupa routingu `(marketing)`, server action `subscribeToWaitlist`, komponenty marketingowe (Hero, Features, Pricing, CTA, Footer, WaitlistForm), hooki URL params, refactor auth (routes.ts, proxy.ts), testy jednostkowe, migracja DB.

**Wynik:** 7 krytycznych błędów blokujących merge, 7 problemów jakościowych, 2 sugestie.

**Najpoważniejsze znaleziska:**
- DOM-based XSS w `landing-script.js`
- Auth bypass przez nieznormalizowaną ścieżkę w `proxy.ts`
- Brak rate limiting na anonimowy INSERT do waitlist
- Race condition w `useUrlSearchParam.ts`
- Złamanie 3 reguł architektury: brak `createAction` HOF, brak `react-hook-form`, duplikacja tras

---

## Files Reviewed

**Zmienione pliki (reviewable):**
- `services/waitlist/actions.ts` *(nowy)*
- `services/waitlist/schemas.ts` *(nowy)*
- `components/marketing/WaitlistForm.tsx` *(nowy)*
- `components/marketing/HeroSection.tsx` *(nowy)*
- `components/marketing/CtaSection.tsx` *(nowy)*
- `components/marketing/FeaturesSection.tsx` *(nowy)*
- `components/marketing/PricingSection.tsx` *(nowy)*
- `components/marketing/Footer.tsx` *(nowy)*
- `app/(marketing)/page.tsx` *(nowy)*
- `app/(marketing)/layout.tsx` *(nowy)*
- `app/(marketing)/landing.css` *(nowy)*
- `app/(marketing)/privacy/page.tsx` *(nowy)*
- `lib/routes.ts` *(nowy)*
- `lib/supabase/proxy.ts` *(zmodyfikowany)*
- `next.config.ts` *(zmodyfikowany)*
- `hooks/useTableParams.ts` *(nowy)*
- `hooks/useUrlSearchParam.ts` *(nowy)*
- `app/(auth)/login/_hooks/useSignInServerAction.ts` *(nowy)*
- `app/(auth)/login/_components/LoginForm.tsx` *(zmodyfikowany)*
- `app/(auth)/login/page.tsx` *(zmodyfikowany)*
- `app/(dashboard)/_components/AuthToastHandler.tsx` *(nowy)*
- `app/(dashboard)/board/page.tsx` *(zmodyfikowany)*
- `components/layout/sidebarNav.tsx` *(zmodyfikowany)*
- `components/layout/constants.ts` *(zmodyfikowany)*
- `public/landing-script.js` *(nowy)*
- `supabase/migrations/20260414000000_create_waitlist_subscribers.sql` *(nowy)*
- `types/database.ts` *(zmodyfikowany)*
- `__tests__/components/marketing/WaitlistForm.test.tsx` *(nowy)*
- `__tests__/services/waitlist/actions.test.ts` *(nowy)*
- `components/layout/__tests__/appSidebar.test.tsx` *(zmodyfikowany)*
- `components/layout/__tests__/sidebarNav.test.tsx` *(zmodyfikowany)*
- `.husky/pre-commit` *(zmodyfikowany)*

---

## services/waitlist/actions.ts

### Issues

**Critical:**
- **Line 8–56:** Brak `createAction()` HOF wrapper — server action implementuje własny ad-hoc error handling. CLAUDE.md: *"Server actions MUSZĄ używać createAction() wrapper"*. Ręczne parsowanie Zod, inline error objects, niestandaryzowane kody błędów poza `ErrorCodes` enum — każda kolejna akcja zduplikuje ten boilerplate. [Lens: Structural]

**Quality:**
- **Line 25:** `tryCatch(createClient())` — `createClient()` jest wywoływane **przed** przekazaniem do `tryCatch`. Synchroniczny wyjątek z `createClient()` (np. brak env var) NIE jest złapany — propaguje się jako uncaught exception zamiast zwrócić `ActionResult`. [Lens: Quality]

### Suggested Fix

```typescript
'use server';

import { createAction } from '@/services/shared';
import { subscribeToWaitlistSchema } from './schemas';

export const subscribeToWaitlist = createAction(
  async ({ email, source }, { supabase }) => {
    const { error } = await supabase
      .from('waitlist_subscribers')
      .insert({ email, source });

    // Silently succeed for duplicate emails
    if (error?.code === '23505') {
      return { email };
    }

    if (error) throw error;

    return { email };
  },
  { schema: subscribeToWaitlistSchema }
);
```

**Uwaga:** Weryfikuj czy `createAction` wspiera publiczne (bez auth) akcje — jeśli nie, dodaj opcję `requireAuth: false`.

---

## components/marketing/WaitlistForm.tsx

### Issues

**Critical:**
- **Line 1–63:** Formularz nie używa `react-hook-form` z `zodResolver` — naruszenie bezwzględnej reguły CLAUDE.md (*"Formy MUSZĄ używać react-hook-form z @hookform/resolvers/zod"*). Brak client-side validation przed submitem (email trafia na serwer bez weryfikacji po stronie klienta), brak `aria-invalid`/`aria-describedby` na polach błędów. [Lens: Structural + Vercel]
- **Line 19–27:** Własny `useState<Status>` jako loading state zamiast `useFormStatus` z React 19. React 19 + Server Actions mają wbudowany `pending` state przez `useFormStatus` — obecna implementacja jest anty-wzorcem w React 19. [Lens: Vercel]

**Quality:**
- **Line 50:** Inline `onChange={(e) => setEmail(e.target.value)}` — tworzy nową referencję przy każdym renderze. Wyciągnąć do `useCallback`. [Lens: Vercel]

### Suggested Fix

```typescript
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subscribeToWaitlist } from '@/services/waitlist/actions';
import { subscribeToWaitlistSchema, type SubscribeToWaitlistInput } from '@/services/waitlist/schemas';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Zapisywanie...' : 'Zapisz się'}
    </button>
  );
};

interface WaitlistFormProps {
  source?: string;
  className?: string;
}

export const WaitlistForm = ({ source = 'form', className }: WaitlistFormProps) => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<SubscribeToWaitlistInput>({
    resolver: zodResolver(subscribeToWaitlistSchema),
    defaultValues: { email: '', source },
  });

  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return <p className={className}>Zapisano! Damy Ci znać, gdy ruszymy.</p>;
  }

  const onSubmit = async (data: SubscribeToWaitlistInput) => {
    const result = await subscribeToWaitlist(data);
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError('email', { message: result.error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <label htmlFor="waitlist-email" className="sr-only">Email</label>
      <input
        id="waitlist-email"
        type="email"
        placeholder="twoj@email.com"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'waitlist-error' : undefined}
        {...register('email')}
      />
      <SubmitButton />
      {errors.email && <p id="waitlist-error" role="alert">{errors.email.message}</p>}
      <p>
        Twoje dane przetwarzamy zgodnie z{' '}
        <Link href="/privacy">Polityką prywatności</Link>.
      </p>
    </form>
  );
};
```

---

## lib/supabase/proxy.ts

### Issues

**Critical:**
- **Line 10–11 + 65–74:** `publicRoutes` array jest hardcoded z duplikacją wobec `routes` z `lib/routes.ts`. Plik importuje `routes` ale używa go tylko dla redirectów — nie dla definicji tras publicznych. Zmiana trasy w `routes.ts` nie zaktualizuje `publicRoutes`. [Lens: Structural]
- **Line 12–15:** `isMarketingPath()` wykonuje prefix matching bez normalizacji ścieżki. Pathnames jak `/landing-script%2F../admin` lub `//landing-script` mogą przejść przez bypass w zależności od wersji Next.js, omijając całą logikę auth. Dodatkowo marketing routes zwracają `NextResponse.next()` bez odświeżenia tokenu sesji — jeśli token wygaśnie podczas wizyty na landing page, użytkownik zostanie wylogowany. [Lens: Quality/Security]

### Suggested Fix

```typescript
import { routes } from '../routes';

// Single source of truth for public auth routes
const PUBLIC_AUTH_ROUTES = [
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
] as const;

// Normalize pathname to prevent path traversal bypass
function normalizePath(pathname: string): string {
  try {
    return new URL(pathname, 'http://x').pathname;
  } catch {
    return pathname;
  }
}

const MARKETING_PREFIXES = ['/_next', '/favicon', '/landing-script', '/privacy'];

function isMarketingPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (normalized === '/') return true;
  return MARKETING_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isMarketingPath(pathname)) {
    return NextResponse.next();
  }

  // ... rest of middleware ...

  const isPublicRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  // ...
}
```

---

## hooks/useUrlSearchParam.ts

### Issues

**Critical:**
- **Line 16–103:** Podwójny state (URL + `useState`) z synchronizacją przez `useEffect` — race condition w React 19 Concurrent Mode. Stan lokalny jest inicjalizowany raz z URLa (linia 47), ale URL może zmieniać się szybciej niż efekt synchronizuje stan. W React 19 + Concurrent Mode pomiędzy renderem a efektem może nastąpić kolejna nawigacja, powodując niespójny stan. Rozwiązanie: URL jako SSOT bez lokalnego `useState`. [Lens: Vercel]

### Suggested Fix

```typescript
'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export interface UseUrlSearchParamOptions {
  defaultValue?: string;
  replace?: boolean;
}

export interface UseUrlSearchParamReturn {
  value: string;
  setValue: (value: string) => void;
  clearValue: () => void;
}

export function useUrlSearchParam(
  param: string,
  options: UseUrlSearchParamOptions = {}
): UseUrlSearchParamReturn {
  const { defaultValue = '', replace = true } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the single source of truth — no local state needed
  const value = searchParams.get(param) ?? defaultValue;

  const updateUrl = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set(param, newValue);
      } else {
        params.delete(param);
      }
      const query = params.toString();
      const newUrl = `${pathname}${query ? `?${query}` : ''}`;
      if (replace) {
        router.replace(newUrl as Route);
      } else {
        router.push(newUrl as Route);
      }
    },
    [param, pathname, searchParams, replace, router]
  );

  const setValue = useCallback((newValue: string) => updateUrl(newValue), [updateUrl]);
  const clearValue = useCallback(() => updateUrl(''), [updateUrl]);

  return { value, setValue, clearValue };
}
```

---

## hooks/useTableParams.ts

### Issues

**Quality:**
- **Line 26–127:** Hook reimplementuje URL param synchronizację zamiast komponować z `useUrlSearchParam`. Narusza DRY — dwa miejsca do bugfixowania gdy Next.js zmieni API searchParams. [Lens: Structural]
- **Line 37–41:** `useMemo` na `parseInt` pojedynczej liczby — over-engineering. `searchParams` zmienia się jako nowy obiekt przy każdej nawigacji, więc memoizacja i tak wykona parseInt za każdym razem. Koszt tworzenia closure dependencies jest porównywalny z kosztem parseInt. [Lens: Vercel]

### Suggested Fix

```typescript
// Refaktoruj używając useUrlSearchParam jako bloku budulcowego:
function useTableParams(options: UseTableParamsOptions = {}): TableParams {
  const { defaultPageSize = DEFAULT_PAGE_SIZE, defaultSortBy, defaultSortOrder = 'asc' } = options;

  const { value: pageStr, setValue: setPageStr } = useUrlSearchParam('page', { replace: false });
  const { value: pageSizeStr, setValue: setPageSizeStr } = useUrlSearchParam('pageSize', { replace: false });
  const { value: sortByStr, setValue: setSortByStr } = useUrlSearchParam('sortBy', { replace: false });
  const { value: sortOrderStr, setValue: setSortOrderStr } = useUrlSearchParam('sortOrder', { replace: false });

  // Proste parsowanie bez zbędnego useMemo
  const parsed = Number.parseInt(pageStr, 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  // ... analogicznie dla pozostałych

  // ...
}
```

---

## public/landing-script.js

### Issues

**Critical:**
- **Line 200–213:** DOM-based XSS via `document.querySelector(this.getAttribute('href'))`. `this.getAttribute('href')` może zwrócić wartość kontrolowaną przez zewnętrzne skrypty (prototype pollution, dynamicznie wstrzyknięte `<a>` tagi). `querySelector` z niezwalidowanym wejściem pozwala na selector injection. Brak whitelist ani walidacji formatu. [Lens: Quality/Security]

**Quality:**
- **Line 149–164:** `animateValue()` — brak walidacji `parseInt`. Gdy `element.textContent` zawiera spację, myślnik lub jest pustym stringiem, `parseInt` zwraca `NaN`. Wtedy `increment = NaN`, warunek `current >= target` nigdy nie jest spełniony → nieskończony `setInterval` → memory leak. [Lens: Quality]

### Suggested Fix

```javascript
// XSS fix — smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    // Whitelist: only allow #id format
    if (!href || !/^#[\w-]+$/.test(href)) return;
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
    }
  });
});

// NaN fix — animateValue
function animateValue(element) {
  const rawText = element.textContent?.replace(/\s/g, '') ?? '';
  const target = Number.parseInt(rawText, 10);
  if (Number.isNaN(target) || target <= 0) return; // guard: prevent infinite loop

  let current = 0;
  const increment = target / 30;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 1000 / 30);
}
```

---

## supabase/migrations/20260414000000_create_waitlist_subscribers.sql

### Issues

**Critical:**
- **RLS policy:** Anonimowy INSERT bez ograniczeń — brak rate limiting na poziomie DB ani aplikacji. Trivial spam attack może wypełnić tabelę, generować koszty Supabase storage/egress. Cicha deduplikacja (23505 → success) zachęca do brute-force enumeracji danych. [Lens: Quality/Security]

### Suggested Fix

Opcja 1 — CAPTCHA w server action (zalecane):
```typescript
// W subscribeToWaitlist — weryfikuj token Cloudflare Turnstile przed insertem
const turnstileResult = await verifyTurnstile(captchaToken);
if (!turnstileResult.success) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Weryfikacja nieudana' } };
}
```

Opcja 2 — Rate limit przez Upstash Redis w Edge Middleware.

Opcja 3 — DB trigger blokujący > N insertów per email/IP w oknie czasowym.

**Minimum na teraz:** Dodaj Cloudflare Turnstile widget do `WaitlistForm` z ukrytym polem tokenu.

---

## app/(marketing)/landing.css

### Issues

**Quality:**
- **Line 1–800+:** 800+ linii custom CSS importowane w layout.tsx — jawne naruszenie przyjętego stack Tailwind CSS 4. Tworzy równoległy system stylowania: dwa zestawy design tokens (CSS variables vs Tailwind config), niemożliwe do tree-shaken przez Tailwind JIT, wymaga rozumienia dwóch systemów przez każdego dewelopera. [Lens: Structural]

### Suggested Fix

Krótkoterminowo: zablokować dalszy wzrost `landing.css` przez ADR.
Długoterminowo: przenieść design tokens do `tailwind.config.ts` (`theme.extend`), animacje do `@keyframes` w `globals.css` z Tailwind `@layer utilities`.

---

## __tests__/services/waitlist/actions.test.ts

### Issues

**Quality:**
- **Line 14:** `mockInsert.mockClear()` w `beforeEach` jest redundantne — `vitest.config.mts` ma `restoreMocks: true`, które automatycznie czyści mocks po każdym teście. Manualne `mockClear()` wprowadza fałszywe wrażenie że cleanup jest potrzebny i może być skopiowane do innych testów. [Lens: Quality]

### Suggested Fix

```typescript
beforeEach(() => {
  // mockInsert.mockClear() — usunąć, vitest.config restoreMocks: true już to robi
  mockInsert.mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({ insert: mockInsert });
  vi.mocked(createClient).mockResolvedValue(
    mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>
  );
});
```

---

## app/(marketing)/page.tsx

### Issues

**Suggestion:**
- **Line 13:** `strategy="afterInteractive"` dla statycznego skryptu landingowego. Strona marketingowa to Server Component bez interaktywności zależnej od skryptu. `strategy="lazyOnload"` odkłada ładowanie do momentu bezczynności przeglądarki, nie blokując TTI. [Lens: Vercel]

### Suggested Fix

```typescript
<Script src="/landing-script.js" strategy="lazyOnload" />
```

---

## __tests__/components/marketing/WaitlistForm.test.tsx

### Issues

**Suggestion:**
- **Brakujące testy:** (1) Prop `source` nie jest weryfikowany jako argument `subscribeToWaitlist` — można zmienić implementację bez wykrycia w testach. (2) Brak testu `aria-describedby` łączącego input z komunikatem błędu (WCAG 1.3.1). (3) Brak testu retry po error — czy formularz wraca do stanu sprzed błędu. [Lens: Quality]

### Suggested Fix

```typescript
it('passes source prop to subscribeToWaitlist', async () => {
  render(<WaitlistForm source="landing" />);
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));
  expect(subscribeToWaitlist).toHaveBeenCalledWith(
    expect.objectContaining({ source: 'landing' })
  );
});

it('associates error message with input via aria-describedby', async () => {
  vi.mocked(subscribeToWaitlist).mockResolvedValue({
    success: false,
    error: { code: 'DATABASE_ERROR', message: 'Błąd' },
  });
  render(<WaitlistForm />);
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));
  await waitFor(() => {
    const input = screen.getByRole('textbox', { name: /email/i });
    const error = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });
});
```

---

## Summary Checklist

### Must Fix Before Merge

- [ ] **services/waitlist/actions.ts** — Zastąpić ad-hoc error handling przez `createAction()` HOF wrapper
- [ ] **components/marketing/WaitlistForm.tsx** — Zrefaktorować używając `react-hook-form` + `zodResolver` + `useFormStatus`
- [ ] **lib/supabase/proxy.ts** — Użyć `routes` jako SSOT dla publicRoutes + znormalizować pathname w `isMarketingPath`
- [ ] **hooks/useUrlSearchParam.ts** — Usunąć lokalny `useState` + `useEffect` — URL jako single source of truth
- [ ] **public/landing-script.js** — Dodać whitelist regex dla querySelector (XSS fix) + guard dla `animateValue` (NaN memory leak)
- [ ] **supabase/migrations/...sql** — Dodać rate limiting dla anon INSERT (Cloudflare Turnstile lub Upstash Redis)
- [ ] **services/waitlist/actions.ts** — Naprawić `tryCatch(createClient())` — przekazać callback zamiast wywołanego Promise

### Should Fix

- [ ] **lib/supabase/proxy.ts** — Deduplikacja `publicRoutes` → użyć `routes` zamiast hardcoded strings
- [ ] **hooks/useTableParams.ts** — Skomponować z `useUrlSearchParam` zamiast reimplementacji; usunąć zbędne `useMemo` na parseInt
- [ ] **app/(marketing)/landing.css** — Zablokować dalszy wzrost custom CSS, zaplanować migrację do Tailwind tokens
- [ ] **__tests__/services/waitlist/actions.test.ts** — Usunąć redundantne `mockInsert.mockClear()`
- [ ] **components/marketing/WaitlistForm.tsx** — Wyciągnąć inline `onChange` do `useCallback`

### Optional

- [ ] **app/(marketing)/page.tsx** — Zmienić Script strategy na `lazyOnload`
- [ ] **__tests__/components/marketing/WaitlistForm.test.tsx** — Dodać testy: source prop, aria-describedby, retry flow
