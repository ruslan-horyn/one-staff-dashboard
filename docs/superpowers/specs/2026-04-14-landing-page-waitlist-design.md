# Landing Page + Waitlista — Spec

**Data:** 2026-04-14
**Projekt:** One Staff Dashboard
**Sub-projekt:** #1 z serii "next steps po MVP"
**Cel:** Publiczny URL z landing page + mechanizm zbierania maili (waitlista) jako pierwszy widoczny milestone przed pełnym deployem aplikacji.

---

## Kontekst

MVP aplikacji jest feature-complete i działa lokalnie. Ten podprojekt to pierwszy krok w kierunku "projekt jest live i ludzie o nim wiedzą". Landing page pozwala budować listę zainteresowanych zanim aplikacja zostanie publicznie udostępniona.

**Materiały wejściowe:**
- Design: `layout-generator` → `projects/one_staff_dashboard/landing-page/style_050_rounded_symm_v4/` (index.html + styles.css + script.js) — to jest **placeholder**, docelowy design będzie inny
- Copy: `/Users/ruslanhoryn/Projects/layout-generator/brief/copy.md` + `docs/LANDING-PAGE-COPY.md`

---

## Architektura i routing

### Nowa grupa routów `(marketing)`

```
app/
  (marketing)/
    layout.tsx          ← minimalny layout: head, font, landing.css — BEZ app-shell/sidebar
    page.tsx            ← landing page "/"
    privacy/
      page.tsx          ← polityka prywatności "/privacy"
  (dashboard)/          ← istniejące trasy, bez zmian
```

### Zmiany w `proxy.ts`

Dodanie whitelist publicznych ścieżek — unauthenticated users NIE są przekierowywani na `/login` dla:
- `/` — landing page
- `/privacy` — polityka prywatności

Waitlista używa server actions (nie API route), więc nie wymaga osobnego wpisu w proxy.

Wszystkie inne ścieżki zachowują obecne zachowanie (redirect na `/login`).

---

## Baza danych — migracja Supabase

### Tabela `waitlist_subscribers`

```sql
create table waitlist_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text,           -- 'hero' | 'cta_bottom' | inne
  created_at  timestamptz default now()
);
```

### RLS

- `INSERT`: dozwolony dla roli `anon` — formularz publiczny, bez logowania
- `SELECT`: tylko `authenticated` z rolą `admin`
- `UPDATE`, `DELETE`: zablokowane

### Server action `subscribeToWaitlist`

Lokalizacja: `services/waitlist/actions.ts`

- Walidacja Zod: email wymagany, format email
- Obsługa `DUPLICATE_ENTRY`: cicha (nie zwraca błędu użytkownikowi — "jesteś już na liście")
- Używa istniejącego wzorca `createAction()` z `services/shared/`
- Zwraca `ActionResult<{ email: string }>`

Schema: `services/waitlist/schemas.ts`

```typescript
export const subscribeToWaitlistSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});
```

---

## Komponenty

### Permanentne (nie wymieniane przy zmianie designu LP)

**`components/marketing/WaitlistForm.tsx`**
- Props: `source?: string` (do śledzenia skąd zapis)
- Stany UI: `idle` | `loading` | `success` | `error`
- Komunikaty:
  - success: "Zapisano! Damy Ci znać, gdy ruszymy."
  - duplicate: "Ten adres jest już na liście."
  - error: "Coś poszło nie tak. Spróbuj ponownie."
- Stylowany neutralnie — adaptowalny do każdego przyszłego LP designu
- Zawiera jednolinijkowy privacy notice: "Twoje dane przetwarzamy zgodnie z [Polityką prywatności](/privacy)"

### Wymienne (throwaway — placeholder dla obecnego szablonu)

```
components/marketing/
  HeroSection.tsx       ← zawiera WaitlistForm source="hero"
  FeaturesSection.tsx
  PricingSection.tsx
  CtaSection.tsx        ← zawiera WaitlistForm source="cta_bottom"
  Footer.tsx
```

Sekcje zawierają HTML z generatora przepisany na TSX. CSS pozostaje w `landing.css` importowanym przez `(marketing)/layout.tsx`. Gdy design się zmieni — wymieniane są tylko pliki sekcji i CSS, routing/backend/WaitlistForm bez zmian.

---

## Strona prywatności `/privacy`

Statyczna strona TSX (nie MDX, nie CMS). Zawiera minimum RODO:
- Co zbieramy: adres email
- Cel: informowanie o uruchomieniu produktu (waitlista)
- Podstawa prawna: zgoda
- Czas przechowywania: do uruchomienia produktu lub do rezygnacji
- Jak usunąć dane: kontakt na adres email admina
- Administrator danych: imię/nazwisko lub firma + adres email

Tekst generowany z pomocą AI, przejrzany przez właściciela przed deployem.

## Kontakt i zarządzanie subskrybentami

**Podejście:** email-based, bez automatyzacji.

- Adres email kontaktowy widoczny w stopce LP i w polityce prywatności
- Polityka prywatności zawiera instrukcję: "Aby usunąć swój adres lub się skontaktować, napisz na `[email]`"
- Właściciel usuwa rekordy ręcznie w Supabase Table Editor
- Brak strony `/unsubscribe`, brak tokenów, brak wysyłki maili (to osobny podprojekt)

Docelowo (gdy pojawi się wysyłka maili do waitlisty): dodać link unsubscribe w stopce każdego maila — ale to poza zakresem tego podprojektu.

---

## Kolejna iteracja — #1b (osobna sesja)

Design i "WOW efekt" landing page — osobny podprojekt po wdrożeniu infrastruktury:
- Nowy design LP (nie placeholder z generatora)
- Lepsza treść / copy — co użytkownik zyskuje, bardziej zrozumiałe wartości
- Animowane demo dashboardu w hero section (Remotion.dev — React → animacja/video)
- Skill do użycia: `ui-planner` + `ui-builder`

## Poza zakresem tego podprojektu

| Temat | Powód wykluczenia |
|-------|-------------------|
| Cookie consent banner | Brak tracking cookies (brak analytics) = nie wymagany |
| Analytics | Osobny podprojekt |
| i18n / EN wersja | Osobna iteracja po walidacji PL |
| Stripe / płatności | Dopiero po pierwszych użytkownikach |
| Własna domena (konfiguracja) | 15 minut pracy, ale osobna decyzja właściciela |
| Finalna wersja designu LP | Obecny szablon to placeholder |
| Testy E2E dla LP | MVP marketingowy, nie krytyczna ścieżka biznesowa |

---

## Definicja ukończenia (Done)

- [ ] Landing page dostępna pod publicznym URL (Vercel preview lub produkcja)
- [ ] Formularz zapisuje email do Supabase (`waitlist_subscribers`)
- [ ] Duplikaty obsługiwane cicho
- [ ] Strona `/privacy` dostępna i zlinkowana z formularza
- [ ] Proxy nie blokuje `/`, `/privacy` dla niezalogowanych
- [ ] Wygląd działa na mobile (responsywność z szablonu generatora)
