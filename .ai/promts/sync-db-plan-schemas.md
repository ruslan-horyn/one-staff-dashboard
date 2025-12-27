# Zadanie: Synchronizacja dokumentacji bazy danych i walidacja schematów

## Kontekst

Jesteś ekspertem od baz danych PostgreSQL i TypeScript/Zod w projekcie Next.js z Supabase. Projekt używa:

- Supabase jako bazy danych PostgreSQL
- Zod do walidacji danych wejściowych
- Automatycznie generowanych typów TypeScript z bazy (`types/database.ts`)

Wykryto rozbieżność między dokumentacją schematu bazy (`docs/db-plan.md`) a rzeczywistymi migracjami SQL. Dokumentacja musi odzwierciedlać aktualny stan bazy danych.

## Pliki źródłowe

### Migracje SQL (ŹRÓDŁO PRAWDY)

- `supabase/migrations/20251209220746_tables.sql` - definicje tabel
- `supabase/migrations/20251209220747_indexes.sql` - indeksy
- `supabase/migrations/20251209220748_functions_triggers.sql` - funkcje i triggery
- `supabase/migrations/20251209220749_rls_policies.sql` - polityki RLS

### Dokumentacja do aktualizacji

- `docs/db-plan.md` - schemat bazy danych

### Schematy Zod do weryfikacji

- `services/shared/schemas.ts` - współdzielone schematy bazowe
- `services/auth/schemas.ts` - autentykacja
- `services/clients/schemas.ts` - klienci
- `services/workers/schemas.ts` - pracownicy tymczasowi
- `services/work-locations/schemas.ts` - lokalizacje pracy
- `services/positions/schemas.ts` - stanowiska
- `services/assignments/schemas.ts` - przypisania
- `services/reports/schemas.ts` - raporty

### Referencja typów

- `types/database.ts` - wygenerowane typy TypeScript z bazy

## Zadania do wykonania

### Faza 1: Analiza migracji SQL

Przeczytaj wszystkie pliki migracji i wyodrębnij dla każdej tabeli:

1. **Struktura kolumn:**
   - Nazwa kolumny
   - Typ danych PostgreSQL
   - Ograniczenia (NOT NULL, UNIQUE, DEFAULT, CHECK)
   - Klucze obce (REFERENCES)

2. **Indeksy:**
   - Nazwa indeksu
   - Typ (B-tree, GIN, partial)
   - Kolumny

3. **Funkcje i triggery:**
   - Nazwa i cel
   - Tabele, których dotyczą

4. **Polityki RLS:**
   - Operacja (SELECT, INSERT, UPDATE, DELETE)
   - Warunek dostępu

### Faza 2: Aktualizacja db-plan.md

Zaktualizuj `docs/db-plan.md` aby dokładnie odzwierciedlał stan z migracji:

**Format dla każdej tabeli:**

```markdown
### Tabela `nazwa_tabeli`

| Kolumna | Typ danych | Ograniczenia |
|---------|------------|--------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NULL |
```

**Krytyczne sprawdzenia:**

- Czy kolumna ma `NOT NULL` czy jest nullable?
- Czy są wartości domyślne (`DEFAULT`)?
- Czy są ograniczenia `CHECK`?
- Czy są klucze obce i jaka jest akcja `ON DELETE`?

### Faza 3: Weryfikacja schematów Zod

Porównaj schematy Zod ze zaktualizowanym `db-plan.md`:

**Dla każdego schematu sprawdź:**

1. **Pola wymagane vs opcjonalne:**
   - Kolumna `NOT NULL` w DB → pole wymagane w Zod (bez `.optional()`)
   - Kolumna nullable w DB → pole opcjonalne w Zod (`.optional()` lub `.nullable()`)

2. **Typy danych:**
   - `VARCHAR(n)` → `z.string().max(n)`
   - `TEXT` → `z.string()`
   - `UUID` → `z.string().uuid()`
   - `BOOLEAN` → `z.boolean()`
   - `TIMESTAMPTZ` → `z.string().datetime()` lub `z.coerce.date()`
   - `JSONB` → `z.record()` lub custom schema

3. **Wartości domyślne:**
   - Kolumna z `DEFAULT` w DB → może być `.optional()` w schema tworzenia
   - Kolumny auto-generowane (`id`, `created_at`) → nie wymagane w schema tworzenia

**Przykład porównania:**

```
DB (migration):
  email VARCHAR(255) NULL

Zod schema (createClientSchema):
  email: optionalEmailSchema  ✅ Poprawne (nullable = optional)

DB (migration):
  name VARCHAR(255) NOT NULL

Zod schema (createClientSchema):
  name: z.string().min(1).max(255)  ✅ Poprawne (NOT NULL = required)
```

## Format wyjściowy

### 1. Raport rozbieżności db-plan.md

```markdown
## Znalezione rozbieżności w db-plan.md

### Tabela: clients
| Kolumna | db-plan.md | Migracja SQL | Akcja |
|---------|------------|--------------|-------|
| email | NULL | NOT NULL | Zmienić na NOT NULL |
| phone | NULL | NOT NULL | Zmienić na NOT NULL |
```

### 2. Raport rozbieżności schematów Zod

```markdown
## Znalezione rozbieżności w schematach Zod

### Plik: services/clients/schemas.ts

#### Schema: createClientSchema
| Pole | Oczekiwane (wg DB) | Aktualne | Status |
|------|-------------------|----------|--------|
| email | wymagane (NOT NULL) | opcjonalne | ❌ Niezgodne |
| phone | wymagane (NOT NULL) | opcjonalne | ❌ Niezgodne |
| name | wymagane | wymagane | ✅ Zgodne |
```

### 3. Podsumowanie zmian

Lista konkretnych zmian do wprowadzenia w każdym pliku.

## Ograniczenia

- NIE zmieniaj migracji SQL - są źródłem prawdy
- NIE zmieniaj `types/database.ts` - jest generowany automatycznie
- Aktualizuj TYLKO `docs/db-plan.md` i schematy w `services/*/schemas.ts`
- Zachowaj istniejący format i styl dokumentacji
