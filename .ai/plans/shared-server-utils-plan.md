# Zadanie: Plan implementacji Shared Server Utils

## Wymagane pliki do przeczytania

Przed rozpoczęciem zapoznaj się z następującymi plikami:

- `docs/prd.md` - wymagania produktowe i user stories
- `docs/tech-stack.md` - stack technologiczny projektu
- `docs/directory-architecture.md` - architektura katalogów i konwencje

## Kontekst projektu

One Staff Dashboard - wewnętrzny panel MVP dla agencji pracy tymczasowej. Zastępuje manualne procesy oparte na arkuszach kalkulacyjnych, centralizując zarządzanie pracownikami tymczasowymi, klientami, miejscami pracy i harmonogramami.

**Kluczowe informacje z dokumentacji:**

**Tech stack (z docs/tech-stack.md):**

- Next.js 16 (App Router) z Server Actions
- React 19, TypeScript 5
- Supabase (PostgreSQL + Auth z JWT)
- Zod do walidacji

**Lokalizacja plików (z docs/directory-architecture.md):**

```
services/
├── shared/                   # ← TUTAJ implementujemy
│   ├── result.ts             # ActionResult<T> type
│   ├── errors.ts             # Error codes and Supabase mapping
│   ├── pagination.ts         # Pagination helpers
│   └── index.ts
├── [module]/
│   ├── actions.ts            # Server actions używające shared utils
│   ├── queries.ts
│   ├── schemas.ts            # Zod schemas
│   └── index.ts
```

**Domena (z docs/prd.md):**

- Role: Administrator, Coordinator
- Encje: Clients, Work Locations, Workers, Positions, Assignments
- Główny workflow: przypisywanie pracowników do stanowisk

## Cel

Zaprojektuj zestaw "shared server utils" w `/services/shared/` który zapewni:

1. **Zunifikowany format odpowiedzi** - `ActionResult<T>` z `{ success, data, error }`
2. **Spójną obsługę błędów** - mapowanie błędów Supabase, Zod, nieoczekiwanych
3. **Sprawdzanie sesji** - helper do weryfikacji zalogowanego użytkownika
4. **Type-safe wrapper** - HOF do opakowywania Server Actions
5. **Dev logging** - proste console.log tylko w development

## Wymagania

### Musi zawierać:

- `result.ts` - typ `ActionResult<T>` i helpery do tworzenia odpowiedzi
- `errors.ts` - typy błędów, kody, mapowanie Supabase → przyjazne komunikaty
- `action-wrapper.ts` - wrapper dla Server Actions z obsługą błędów i auth
- `auth.ts` - helper do sprawdzania sesji Supabase

### Nie zawiera (poza zakresem MVP):

- Rate limiting / security
- Audit logging (będzie osobno)
- Sprawdzanie ról (Admin vs Coordinator)
- Obsługa Route Handlers / REST API
- Pagination helpers (już zaplanowane w `pagination.ts`)

## Oczekiwany output

### 1. Definicje typów

Zdefiniuj wszystkie typy TypeScript dla:

- `ActionResult<T>` - sukces i błąd
- `ActionError` - struktura błędu z kodem i wiadomością
- `ErrorCode` - enum/union z kodami błędów

### 2. Implementacja każdego pliku

Dla każdego pliku w `/services/shared/`:

- Pełna sygnatura funkcji/typów
- Krótki opis działania
- Kod implementacji

### 3. Przykład użycia w Server Action

Pokaż kompletny Server Action (np. `createWorker`) używający:

- Zod schema z `/services/workers/schemas.ts`
- Wrappera z auth check
- Zunifikowanej odpowiedzi

## Ograniczenia

- Kompatybilność z Next.js 16 App Router
- Directive `"use server"` gdzie wymagane
- Prostota (MVP) - bez over-engineeringu
- Logowanie tylko gdy `process.env.NODE_ENV === 'development'`
- Strict TypeScript - pełne typowanie

## Format odpowiedzi

Plan implementacji z konkretnymi przykładami kodu TypeScript.
Komentarze wyjaśniające kluczowe decyzje architektoniczne.
Gotowy do implementacji bez dodatkowych pytań.
