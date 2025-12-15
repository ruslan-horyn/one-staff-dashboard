# Prompt: Architektura katalogów Next.js dla One Staff Dashboard

## Kontekst projektu

Tworzę wewnętrzną aplikację MVP dla agencji pracy tymczasowej. Aplikacja zastępuje manualne procesy oparte na arkuszach kalkulacyjnych.

### Tech Stack
- **Framework:** Next.js 16 (App Router) z React 19
- **Język:** TypeScript 5
- **Stylowanie:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + JWT auth)
- **State management:** Zustand
- **Ikony:** Lucide React
- **Testy:** Vitest + React Testing Library + MSW (unit), Playwright (E2E)

### Domena biznesowa
- **Role użytkowników:** Administrator, Koordynator
- **Główne encje:** Klienci, Miejsca Pracy, Pracownicy Tymczasowi, Otwarte Stanowiska, Przypisania
- **Kluczowe funkcje:** CRUD dla encji, przypisywanie pracowników do stanowisk, raportowanie godzin, log audytowy

---

## Zadanie

Stwórz szczegółową architekturę katalogów dla projektu Next.js App Router, która:

1. **Jasno definiuje lokalizację każdego typu pliku** - komponenty, hooki, utils, typy, API, testy
2. **Stosuje konwencje Next.js 16** - grupy routingu, współdzielone layouty, server/client components
3. **Wspiera domain-driven design** - organizacja według funkcjonalności/domeny
4. **Jest skalowalna** - łatwa do rozszerzenia o nowe moduły
5. **Zawiera przykłady** - dla każdego katalogu pokaż przykładowe pliki

---

## Wymagania struktury

### Katalogi główne
```
src/
├── app/                    # Next.js App Router - routing i strony
├── components/             # Komponenty React (shared + feature-specific)
├── lib/                    # Konfiguracje, klienty (Supabase), utilities
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript types i interfaces
├── services/               # Logika biznesowa, API calls
├── utils/                  # Pure utility functions
└── __tests__/              # Testy jednostkowe (mirror struktury src/)
```

### Struktura `app/` (App Router)
Uwzględnij:
- Grupy routingu `(auth)`, `(dashboard)` dla różnych layoutów
- Route handlers dla API (`route.ts`)
- Loading, error, not-found states
- Middleware dla auth

### Struktura `components/`
Rozróżnij:
- `ui/` - bazowe komponenty UI (Button, Input, Modal, Table)
- `layout/` - komponenty layoutu (Header, Sidebar, Footer)
- `features/` - komponenty per domena (workers/, clients/, assignments/)
- `forms/` - formularze z react-hook-form

### Konwencje nazewnictwa
- Komponenty: PascalCase (`WorkerCard.tsx`)
- Hooki: camelCase z prefixem `use` (`useWorkers.ts`)
- Utils/lib: camelCase (`formatDate.ts`)
- Typy: PascalCase z suffixem (`Worker.types.ts` lub `types/worker.ts`)
- Testy: `.test.ts` lub `.spec.ts`

---

## Oczekiwany output

Wygeneruj:

1. **Pełne drzewo katalogów** z przykładowymi plikami dla każdego katalogu
2. **Opis każdego katalogu** - co powinien zawierać, kiedy go używać
3. **Przykładowe ścieżki importów** używając aliasu `@/`
4. **Checklist dla nowych plików** - "Gdzie umieścić nowy..."
   - Komponent UI? → `src/components/ui/`
   - Komponent specyficzny dla workers? → `src/components/features/workers/`
   - Hook do pobierania danych? → `src/hooks/`
   - API endpoint? → `src/app/api/[resource]/route.ts`
   - Typ TypeScript? → `src/types/[domain].ts`
   - Store Zustand? → `src/stores/[domain]Store.ts`

---

## Dodatkowe wytyczne

### Server vs Client Components
- Domyślnie Server Components (bez 'use client')
- Client Components tylko gdy potrzebne: interaktywność, hooks, browser API
- Oznacz wyraźnie granicę client/server w strukturze

### Supabase
- Klient Server: `src/lib/supabase/server.ts`
- Klient Client: `src/lib/supabase/client.ts`
- Typy z bazy: `src/types/database.ts` (generowane przez Supabase CLI)

### Testy
- Unit testy: kolocacja z kodem lub `__tests__/`
- E2E testy: `e2e/` w root projektu
- Mocks: `src/__mocks__/`

---

## Przykład oczekiwanego formatu odpowiedzi

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Strona logowania
│   │   └── layout.tsx            # Layout dla niezalogowanych
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout z sidebar/header
│   │   ├── page.tsx              # Główna tablica (lista pracowników)
│   │   ├── workers/
│   │   │   ├── page.tsx          # Lista pracowników
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Szczegóły pracownika
│   │   │   └── new/
│   │   │       └── page.tsx      # Formularz nowego pracownika
│   │   ├── clients/              # Zarządzanie klientami
│   │   ├── locations/            # Miejsca pracy
│   │   ├── assignments/          # Przypisania
│   │   └── reports/              # Raporty
│   ├── api/
│   │   ├── workers/
│   │   │   └── route.ts          # GET/POST workers
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table/
│   │   │   ├── Table.tsx
│   │   │   ├── TableHeader.tsx
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel export
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── features/
│       ├── workers/
│       │   ├── WorkerCard.tsx
│       │   ├── WorkerList.tsx
│       │   ├── WorkerForm.tsx
│       │   └── index.ts
│       ├── assignments/
│       └── reports/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
│       ├── formatDate.ts
│       └── cn.ts                 # classnames helper
├── hooks/
│   ├── useWorkers.ts
│   ├── useAuth.ts
│   └── useDebounce.ts
├── stores/
│   ├── authStore.ts
│   ├── workersStore.ts
│   └── uiStore.ts
├── types/
│   ├── database.ts               # Typy Supabase (generowane)
│   ├── worker.ts
│   ├── client.ts
│   ├── assignment.ts
│   └── index.ts
├── services/
│   ├── workers.service.ts
│   ├── auth.service.ts
│   └── reports.service.ts
└── middleware.ts                 # Next.js middleware (auth guard)
```

Dla każdego katalogu dodaj krótki opis: kiedy i dlaczego dodawać tam pliki.
