# Raport: One Staff Dashboard — Analiza pomysłu, ocena MVP i rekomendacje

**Data:** 2026-02-10
**Autor:** Konsultacja z Claude (AI)
**Projekt:** One Staff Dashboard
**Lokalizacja projektu:** `/Users/ruslanhoryn/Own_projects/one-staff-dashboard/`
**Dokumentacja pomysłu:** `/Users/ruslanhoryn/Projects/layout-generator/brief/`

---

## 1. Podsumowanie pomysłu

**One Staff Dashboard** to SaaS (web app) dla agencji pracy tymczasowej, zastępujący Excel/arkusze w zarządzaniu pracownikami, harmonogramami, przypisaniami i raportami godzin.

**Target:** Koordynatorzy i administratorzy w agencjach pracy tymczasowej (50-150+ pracowników), w branżach:

- Sprzątanie
- Gastronomia / hospitality
- Obsługa placówek medycznych (podwykonawcy)
- Inne agencje pracy tymczasowej

**Problem:** Agencje zarządzają pracownikami w rozproszonych arkuszach Excel i komunikacji email. Proces jest nieefektywny, podatny na błędy i nie skaluje się. Brak centralnego źródła prawdy, ręczne tworzenie harmonogramów, trudności w szybkim znalezieniu dostępnych pracowników, ręczne generowanie raportów godzin.

**Źródło pomysłu:** Osobiste doświadczenie pracy w agencji staffingowej (~150 pracowników) + kontakty branżowe potwierdzające problem.

---

## 2. Ocena pomysłu — 7/10

### Mocne strony

| Kryterium | Ocena | Dlaczego |
|-----------|-------|----------|
| **Problem** | 9/10 | Realny, potwierdzony osobistym doświadczeniem i rozmowami z 2+ osobami z branży |
| **Dopasowanie skills** | 9/10 | Idealnie pasuje do React fullstack — dashboardy, tabele, CRUD, formularze |
| **Model biznesowy** | 8/10 | B2B SaaS z subskrypcją — najlepszy model dla indie developera |
| **Wzorzec "Excel replacement"** | 8/10 | Ludzie wiedzą że mają problem, nie trzeba ich przekonywać |
| **Unfair advantage** | 8/10 | Wiedza branżowa z pierwszej ręki + kontakty do walidacji |

### Słabe strony / ryzyka

| Kryterium | Ocena | Dlaczego |
|-----------|-------|----------|
| **Dystrybucja** | 4/10 | Brak planu dotarcia do klientów. Agencje nie siedzą na ProductHunt/Twitterze |
| **Pricing** | 5/10 | 50-200 PLN/mies to za mało. Potrzeba 3-4x podwyżki |
| **Wielkość rynku PL** | 6/10 | Ile agencji z 50-150 pracownikami jest w PL? Może być za mały sufit |
| **Konkurencja** | 7/10 | Zoho Workerly ($45/mies), Workstaff ($99/mies), Shiftboard, NextCrew, Connecteam. Ale wszystkie są enterprise/generyczne |
| **MVP scope** | 5/10 | PRD zawiera 14 user stories — zbyt duży zakres na MVP. Trzeba obciąć |

---

## 3. Stan implementacji

### Zrealizowane (fundament gotowy)

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| **Auth** | 100% | Login, register (z tworzeniem organizacji), password reset, session management (JWT + Supabase) |
| **Multi-tenancy** | 100% | Tabela organizations, organization_id na wszystkich tabelach biznesowych |
| **RLS** | 100% | Polityki per rola (admin/coordinator) na każdej tabeli |
| **Database schema** | 100% | 9 tabel: profiles, organizations, clients, work_locations, positions, temporary_workers, assignments, assignment_audit_log. 7+ migracji |
| **DB functions** | 100% | cancel_assignment(), end_assignment(), get_hours_report(), is_worker_available(), normalize_phone(), user_organization_id(), user_role() |
| **Client management** | 100% | Pełny CRUD z UI: search, pagination, sorting, soft delete, error handling |
| **UI components** | 80% | 40+ komponentów: data table, formularze, dialog, dark mode, toast, breadcrumbs, etc. |
| **Testing** | 90% | Vitest (300+ testów), Playwright E2E, MSW mocking, coverage checks w pre-commit |
| **CI/CD** | 100% | GitHub Actions, Docker (dev + prod + e2e), Vercel deploy |
| **Code patterns** | 100% | createAction() HOF, ActionResult<T>, Zod schemas, error mapping, pagination helpers, query helpers |

### Niezrealizowane (pozostało do MVP)

| Funkcja | Trudność | Szacowany czas | Co jest przygotowane |
|---------|----------|----------------|---------------------|
| **Workers CRUD + UI** | Łatwa | 2-3 dni | Zod schemas gotowe, wzorzec z Clients do skopiowania |
| **Work Locations CRUD + UI** | Łatwa | 2-3 dni | Zod schemas gotowe, wzorzec z Clients |
| **Positions CRUD + UI** | Łatwa | 1-2 dni | Zod schemas gotowe, prostsza wersja Clients |
| **Assignments CRUD + UI** | Średnia | 3-4 dni | Zod schemas gotowe, DB functions gotowe (cancel, end), status enum gotowy |
| **Board view (dashboard)** | Średnia | 2-3 dni | Stub page istnieje, data table gotowy, hooki do filtrowania gotowe |
| **Reports + CSV export** | Łatwa | 1-2 dni | DB function get_hours_report() gotowa, schemas gotowe |
| **Audit log connection** | Łatwa | 0.5 dnia | Tabela istnieje, trzeba podłączyć triggery |

**Łączny szacowany czas do feature-complete MVP: 2-3 tygodnie (wieczory/weekendy) lub ~1 tydzień full-time.**

---

## 4. Rekomendacje strategiczne

### 4.1. Pricing — PODNIEŚ CENY

**Obecny plan (za niski):**

- Small: 50 PLN/mies
- Medium: 100 PLN/mies
- Large: 200 PLN/mies

**Rekomendowany plan:**

| Plan | Cena | Target | Limit |
|------|------|--------|-------|
| Starter | 149 PLN/mies | Do 50 pracowników | 1 koordynator |
| Professional | 299 PLN/mies | Do 150 pracowników | 3 koordynatorów |
| Enterprise | 499 PLN/mies | 150+ pracowników | Nielimitowani koordynatorzy |

**Uzasadnienie:**

- Agencja z 150 pracownikami, koordynator spędza 10h/tyg na Excelu = setki PLN oszczędności tygodniowo
- Zoho Workerly: $45/mies (~180 PLN), Workstaff: $99/mies (~400 PLN), Connecteam: $29/mies (~120 PLN)
- Przy 299 PLN/mies potrzebujesz ~30 klientów do $2000 MRR (vs ~160 klientów przy 50 PLN)
- Rabat roczny: 20% (1 miesiąc gratis)

### 4.2. MVP — OGRANICZ ZAKRES

**MVP (4-6 tygodni, odetnij resztę):**

- Workers CRUD (lista, dodaj, edytuj)
- Work Locations CRUD
- Assignments: przypisanie pracownika do lokalizacji z datą start/end
- Board view: tabela pracowników → filtruj kto jest dostępny → przypisz
- CSV export godzin

**Odłóż na v1.1:**

- Audit log (ważne ale nie blokujące)
- Zapraszanie koordynatorów (na start admin = jedyny user)
- Rozbudowane raportowanie
- Powiadomienia
- Zarządzanie pozycjami (na start pracownik przypisany do lokalizacji, nie do pozycji)

### 4.3. Dystrybucja — PLAN DOTARCIA DO KLIENTÓW

**Kanały (w kolejności priorytetów):**

1. **Osobiste kontakty** (tydzień 1)
   - Znajomy z gastro agencji → demo + feedback → testimonial
   - Kontakt z medycznej → demo + feedback → testimonial
   - Prośba o polecenia do ich kontaktów branżowych

2. **Cold outreach LinkedIn** (ongoing)
   - Wyszukaj "właściciel agencji pracy" / "koordynator agencji pracy tymczasowej"
   - Wiadomość: osobista historia + demo offer
   - Cel: 5-10 wiadomości dziennie, 20% response rate

3. **Grupy FB** (ongoing)
   - Grupy branżowe: "Agencje pracy tymczasowej", "Branża sprzątająca", "Gastronomia"
   - NIE spamuj produktem — dodawaj wartość, dziel się wiedzą, potem wspominaj o narzędziu
   - Cel: zostań "ekspertem" w grupie

4. **SEO** (long-term, zacznij od teraz)
   - Blog: "Jak zarządzać pracownikami tymczasowymi bez Excela"
   - Keywords: "zarządzanie pracownikami tymczasowymi", "harmonogram pracy tymczasowej", "raport godzin pracy"
   - Landing page zoptymalizowana pod te frazy

5. **Partnerstwa** (miesiąc 2-3)
   - Biura rachunkowe obsługujące agencje pracy
   - Doradcy HR / konsultanci branżowi
   - Referral fee za polecenie

### 4.4. Walidacja PRZED pełnym buildem

1. **Rozmowy z 5-8 agencjami** (nie znajomymi!) — cold outreach na LinkedIn
   - "Chętnie porozmawiam o tym jak zarządzacie pracownikami. Buduję narzędzie dla branży."
   - Pytaj o ich workflow, nie o swój produkt (metoda "The Mom Test")

2. **Landing page + waitlista** — już masz analizę konkurencji i copy. Postaw stronę.
   - Facebook Ads na właścicieli agencji (~100-200 PLN budżetu testowego)
   - Benchmark: >5% konwersja na signup = dobry sygnał

3. **Pre-sale** — "Lifetime deal za 999 PLN (normalnie 299 PLN/mies) — dostęp na zawsze"
   - Nawet 5-10 sprzedaży = silna walidacja

### 4.5. Skalowanie (po walidacji w PL)

- **i18n od razu** — architektura wielojęzyczna
- Po sukcesie w PL → DACH (Niemcy, Austria, Szwajcaria) + CEE (Czechy, Słowacja)
- Te rynki mają identyczny problem, większy willingness to pay

---

## 5. Analiza konkurencji — podsumowanie

| Konkurent | Cena | Target | Siła | Słabość |
|-----------|------|--------|------|---------|
| Zoho Workerly | $45/mies | Enterprise | Full-featured, ekosystem Zoho | Za skomplikowane dla małych agencji |
| Workstaff | $99/mies | Średnie/duże | Dobry UX, "Excel replacement" messaging | Drogi, event-focused |
| Ubeya | Custom | Enterprise | AI, metryki, testimoniale | Enterprise-only, brak transparentnego pricingu |
| Shiftboard | Custom | Enterprise | Rules-based auto-assignment | Overkill dla 50-150 pracowników |
| Hyre | Custom | Średnie | Approachable, review badges | Generyczny workforce management |
| Connecteam | $29/mies | Małe firmy | Tani, general purpose | Nie jest agencji-specyficzny |
| **Excel** | Darmowy | Wszyscy | Darmowy, elastyczny | Nie skaluje się, brak auditu, error-prone |

**Nisza One Staff Dashboard:** Agencje 50-150 pracowników, polskojęzyczne, "krok wyżej od Excela" — nie enterprise suite. Prostota + cena + lokalizacja.

---

## 6. Ocena techniczna projektu

### Architektura — solidna

- Next.js 16 App Router + React 19 — nowoczesny stack
- Supabase (PostgreSQL + Auth + RLS) — dobry wybór dla MVP
- TypeScript strict, Zod validation, Biome linting
- Server Actions z createAction() HOF — czysty pattern
- Multi-tenancy z RLS — bezpieczna izolacja danych

### Jakość kodu — wysoka

- 300+ unit testów, E2E z Playwright
- Pre-commit hooks z coverage check (90% threshold)
- Conventional commits + commitlint
- Dokumentacja w CLAUDE.md i /docs/

### Co trzeba poprawić

- Dashboard page to stub — trzeba zaimplementować
- Workers/Locations/Positions/Assignments — schemas gotowe, brak akcji i UI
- Audit log — tabela istnieje, triggery nie podłączone
- Brak state management (Zustand zaplanowany ale nie dodany — na razie nie potrzebny)

---

## 7. Plan działania — 90 dni

| Tydzień | Działanie | Rezultat |
|---------|----------|----------|
| **1-2** | Rozmowy z agencjami (5-8 cold outreach) | Zwalidowany problem, lista feature requests |
| **3** | Landing page + FB Ads (~150 PLN) | Dane o konwersji, lista waitlist |
| **4-5** | Workers + Locations + Positions CRUD | Core entities gotowe |
| **6-7** | Assignments CRUD + Board view | Core workflow kompletny |
| **8** | Reports + CSV export + polish | MVP feature-complete |
| **9** | Beta testing z 3-5 agencjami (z rozmów/waitlisty) | Feedback, bugi, brakujące features |
| **10-11** | Iteracja na podstawie feedbacku | Poprawiony produkt |
| **12** | Stripe + pricing + public launch | Pierwsi płacący klienci |
| **13+** | Iteracja + growth (SEO, outreach, referrals) | Skalowanie |

---

## 8. Najważniejsze wnioski

1. **Pomysł jest dobry** — realny problem, potwierdzone bóle, dobry target market. Ocena 7/10 z potencjałem na 8-9/10 po walidacji.

2. **Fundament techniczny jest solidny** — auth, multi-tenancy, RLS, testing, CI/CD, UI components. Nie trzeba budować infrastruktury — czysto feature development.

3. **MVP jest za duży w obecnym PRD** — 14 user stories to za dużo. Ogranicz do 6-7 core stories. Reszta to v1.1.

4. **Pricing jest za niski** — 50 PLN/mies to samobójstwo. Minimum 149 PLN/mies dla małych agencji, 299 PLN dla średnich.

5. **Brak strategii dystrybucji** — to największe ryzyko. Musi być plan: osobiste kontakty → cold outreach → grupy FB → SEO → partnerstwa.

6. **Waliduj ZANIM dokończysz build** — landing page + rozmowy z agencjami + pre-sale. Nie buduj 3 miesiące w ciemno.

7. **"Nudny" problem = dobry biznes** — "dashboard do zarządzania pracownikami tymczasowymi" brzmi nudno. Ale nudne B2B SaaS'y zarabiają. Sexy pomysły umierają.

8. **Time to market jest bliski** — 2-3 tygodnie do feature-complete MVP. To jest moment żeby przyspieszyć i dostarczyć.

9. **Skalowalność jest wbudowana** — i18n + ekspansja na DACH/CEE po walidacji w PL. Architektura to pozwala.

10. **Nie przesadzaj z perfekcjonizmem** — wystarczający MVP > idealny produkt którego nikt nie widzi. Ship it.

---

## 9. Priorytetowa kolejność implementacji

1. **Workers CRUD** → bo bez pracowników nie ma co przypisywać
2. **Work Locations CRUD** → bo przypisania wymagają lokalizacji
3. **Positions** → powiązane z lokalizacjami
4. **Assignments** → core workflow (create, end, cancel)
5. **Board view** → połączenie wszystkiego w jednym widoku
6. **Reports + CSV** → "deal closer" dla klientów

Każdy krok jest **demowalny** — możesz pokazać postęp po każdym.

---

## 10. Pliki projektu — mapa

### Kod źródłowy

- **Projekt:** `/Users/ruslanhoryn/Own_projects/one-staff-dashboard/`
- **App routes:** `/app/(auth)/` (login, register, forgot-password, reset-password), `/app/(dashboard)/` (clients, board stub)
- **Services:** `/services/` (auth, clients, workers/locations/positions/assignments/reports — schemas only)
- **Components:** `/components/ui/` (40+), `/components/layout/`
- **Hooks:** `/hooks/` (12 custom hooks)
- **Types:** `/types/` (9 type files)
- **Database:** `/supabase/migrations/` (7+ migration files)

### Dokumentacja pomysłu

- **Idea:** `/Users/ruslanhoryn/Projects/layout-generator/brief/idea.md`
- **PRD:** `/Users/ruslanhoryn/Own_projects/one-staff-dashboard/docs/prd.md`
- **Competitor analysis:** `/Users/ruslanhoryn/Projects/layout-generator/brief/competitor-analysis.md`
- **Strategy:** `/Users/ruslanhoryn/Projects/layout-generator/brief/strategy.md`
- **Tech stack:** `/Users/ruslanhoryn/Projects/layout-generator/brief/tech-stack.md`
- **Keywords/SEO:** `/Users/ruslanhoryn/Projects/layout-generator/brief/keywords.md`
- **Landing page copy:** `/Users/ruslanhoryn/Projects/layout-generator/brief/copy.md`

---

## 11. Kontekst rozmowy

Ta konsultacja odbyła się w kontekście:

- Programista fullstack React szukający projektu na dochód pasywny
- Firma w której pracuje oferuje wsparcie na rozwój własnych projektów
- Pomysł na One Staff Dashboard noszony od kilku lat
- PRD stworzony w ramach kursu (projekt zaliczeniowy)
- Cel: walidacja pomysłu z zewnętrznego źródła + rekomendacje strategiczne

### Kluczowe frameworki omówione

- **Szukanie niszy:** "Excel replacement" pattern, B2B > B2C, nudne problemy = dobre biznesy
- **Walidacja:** "The Mom Test" (pytaj o workflow, nie o produkt), landing page + ads, pre-sale
- **MVP:** Minimalizuj scope, jedna funkcja zrobiona dobrze, 4-6 tygodni max
- **Pricing:** Wyższa cena niż myślisz, B2B willingness to pay, benchmarki konkurencji
- **Dystrybucja:** Osobiste kontakty → cold outreach → community → SEO → partnerstwa

---

*Raport przygotowany na podstawie analizy kodu źródłowego, dokumentacji projektu i rozmowy konsultacyjnej. Może być użyty jako kontekst dla przyszłych sesji z AI lub jako brief dla zespołu.*
