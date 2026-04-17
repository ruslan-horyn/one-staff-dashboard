# Podsumowanie sesji — 2026-04-14

## Co zostało zrobione

### 1. Strategia i roadmap
- Omówiliśmy sytuację po ukończeniu MVP (projekt działa tylko lokalnie, nikt o nim nie wie)
- Zdecydowaliśmy że pierwszym krokiem jest landing page + waitlista (nie od razu deployment aplikacji)
- Stworzyliśmy mapę 8 podprojektów — droga od "działa lokalnie" do "zarabia"

### 2. Mapa 8 podprojektów (w kolejności)
1. **#1a — Landing page + waitlista** ← SPEC + PLAN GOTOWE, czeka na implementację
2. **#1b — Design + WOW efekt LP** ← osobna sesja po #1a (Remotion.dev, ui-planner)
3. **Produkcja: infrastructure deploy** ← Supabase prod, Vercel, domena
4. **Onboarding nowej agencji** ← first-run experience
5. **Legal dla aplikacji** ← ToS, RODO, DPA
6. **Mailing: waitlista → zaproszenia** ← Resend/Brevo, transactional emails
7. **Analytics** ← Plausible lub Vercel Analytics
8. **Monetyzacja** ← **Stripe** (confirmed), subscription plans, trial
9. **i18n** ← EN first, then global

### 3. Spec #1a (landing page + waitlista)
Plik: `docs/superpowers/specs/2026-04-14-landing-page-waitlist-design.md`

Kluczowe decyzje:
- Opcja A: landing page w istniejącym Next.js repo (nie osobny projekt)
- Supabase backend dla waitlisty (nie Brevo/zewnętrzne)
- Jedna domena: `/` = landing, `/dashboard` = aplikacja, `proxy.ts` zarządza auth
- WaitlistForm to permanentny komponent, sekcje LP to throwaway (design zmieni się w #1b)
- Zarządzanie subskrybentami: email-based (bez automatyzacji, ręczne usuwanie w Supabase Studio)
- Design: style_050_rounded_symm_v4 z layout-generator (placeholder)
- CSS z generatora kopiowany as-is do `app/(marketing)/landing.css`

### 4. Plan implementacji #1a
Plik: `docs/superpowers/plans/2026-04-14-landing-page-waitlist.md`

8 tasków:
1. Supabase migration (`waitlist_subscribers` table + RLS)
2. Waitlist service — schema + server action (TDD)
3. Proxy — whitelist `/` i `/privacy`
4. WaitlistForm component (TDD)
5. Marketing layout + CSS
6. Landing page sections + main page
7. Privacy policy page
8. Final checks + smoke test

### 5. Decyzje techniczne
- **Payments:** Stripe (rozważano Paddle/Lemon Squeezy, zostajemy przy Stripe)
- **Animated demo:** Remotion.dev dla #1b (animowane demo dashboardu w hero)
- **Docs:** zawsze używać context7 MCP przed implementacją zewnętrznych bibliotek

---

## Prompt do następnej sesji

Wklej poniższy prompt na początku nowej sesji:

---

```
Kontynuujemy pracę nad projektem One Staff Dashboard — MVP SaaS dla agencji pracy tymczasowej.

## Co zostało zrobione w poprzedniej sesji (2026-04-14)

MVP jest feature-complete. Zaplanowaliśmy 8 podprojektów post-MVP.
Gotowy spec i plan dla podprojektu #1a (landing page + waitlista).

## Co teraz robimy

Implementacja podprojektu #1a — landing page + waitlista.

**Plan:** `docs/superpowers/plans/2026-04-14-landing-page-waitlist.md`
**Spec:** `docs/superpowers/specs/2026-04-14-landing-page-waitlist-design.md`

Wykonaj plan przez `superpowers:subagent-driven-development`.

## Kluczowy kontekst

- Repo: `/Users/ruslanhoryn/Own_projects/one-staff-dashboard`
- Stack: Next.js 16, React 19, Supabase, TypeScript, Tailwind 4, Zod, Vitest
- Package manager: pnpm
- Proxy auth: `proxy.ts` (nie middleware.ts — Next.js 16)
- Design template source: `/Users/ruslanhoryn/Projects/layout-generator/projects/one_staff_dashboard/landing-page/style_050_rounded_symm_v4/`
- Przed implementacją zewnętrznych bibliotek: użyj context7 MCP po aktualne docs

## Ważne zasady projektu

- Czytaj CLAUDE.md przed implementacją
- Conventional commits (feat/fix/test + scope)
- TDD — najpierw testy, potem implementacja
- data-testid dla selektorów E2E
- Zawsze sprawdzaj docs przez context7 MCP przed użyciem zewnętrznej biblioteki
```
