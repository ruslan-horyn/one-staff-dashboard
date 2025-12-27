# Prompt: Implementacja Pagination Helpers

Jesteś doświadczonym programistą TypeScript, którego zadaniem jest stworzenie modułu pomocniczego do paginacji dla Server Actions i Queries w Next.js.

## Kontekst projektu

1. Architektura projektu:
<directory_architecture>
@docs/directory-architecture.md
</directory_architecture>

2. Istniejące typy paginacji:
<existing_types>
// types/common.ts
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
</existing_types>

3. Istniejące schematy Zod:
<existing_schemas>
// services/shared/schemas.ts
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional().default(DEFAULT_PAGE_SIZE),
});
</existing_schemas>

4. Tech stack:
<tech_stack>
@docs/tech-stack.md
</tech_stack>

---

## Wymagania

Stwórz plik `/services/shared/pagination.ts` zawierający:

### 1. Typy

```typescript
/** Paginated response wrapper */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### 2. Funkcje pomocnicze

| Funkcja | Opis | Sygnatura |
|---------|------|-----------|
| `calculateOffset` | Oblicza offset dla zapytania SQL/Supabase | `(page: number, pageSize: number) => number` |
| `calculateTotalPages` | Oblicza całkowitą liczbę stron | `(totalItems: number, pageSize: number) => number` |
| `createPaginationMeta` | Tworzy obiekt metadanych paginacji | `(params: CreatePaginationMetaParams) => PaginationMeta` |
| `paginateResult` | Opakowuje dane w PaginatedResult | `<T>(data: T[], totalItems: number, page: number, pageSize: number) => PaginatedResult<T>` |
| `applyPaginationToQuery` | Helper do budowania zapytań Supabase z paginacją | `(query: PostgrestFilterBuilder, page: number, pageSize: number) => PostgrestFilterBuilder` |

### 3. Re-eksport stałych

Re-eksportuj `DEFAULT_PAGE_SIZE` i `MAX_PAGE_SIZE` z `@/types/common` dla wygody importu.

---

## Przykłady użycia

### W Query (Server Component)

```typescript
// services/workers/queries.ts
import { paginateResult, calculateOffset } from '@/services/shared/pagination';

export async function getWorkers(params: WorkersFilterInput): Promise<PaginatedResult<Worker>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;
  const offset = calculateOffset(page, pageSize);

  // Get total count
  const { count } = await supabase
    .from('temporary_workers')
    .select('*', { count: 'exact', head: true });

  // Get paginated data
  const { data, error } = await supabase
    .from('temporary_workers')
    .select('*')
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return paginateResult(data ?? [], count ?? 0, page, pageSize);
}
```

### W Server Action

```typescript
// services/workers/actions.ts
import { createAction } from '@/services/shared';
import { paginateResult } from '@/services/shared/pagination';
import type { PaginatedResult } from '@/services/shared/pagination';

export const searchWorkers = createAction<SearchInput, PaginatedResult<Worker>>(
  async (input, { supabase }) => {
    // ... implementation using pagination helpers
  },
  { schema: searchWorkersSchema }
);
```

---

## Wymagania implementacyjne

1. **Pure functions** - wszystkie funkcje muszą być czyste (bez side effects)
2. **Edge cases** - obsługa edge cases:
   - `page < 1` → zwróć offset 0
   - `totalItems = 0` → `totalPages = 0`, `hasNextPage = false`
   - `pageSize > totalItems` → `totalPages = 1`
3. **TypeScript** - pełne typowanie z JSDoc komentarzami
4. **Testy** - przygotuj plik testowy `pagination.test.ts` z przypadkami testowymi
5. **Barrel export** - dodaj eksport do `services/shared/index.ts`

---

## Checklist

- [ ] Utworzono `/services/shared/pagination.ts`
- [ ] Zdefiniowano typy `PaginatedResult<T>` i `PaginationMeta`
- [ ] Zaimplementowano `calculateOffset()`
- [ ] Zaimplementowano `calculateTotalPages()`
- [ ] Zaimplementowano `createPaginationMeta()`
- [ ] Zaimplementowano `paginateResult()`
- [ ] Re-eksportowano stałe z `types/common`
- [ ] Dodano eksport do `services/shared/index.ts`
- [ ] Utworzono testy jednostkowe (opcjonalnie)

---

## Lokalizacja pliku

Zapisz implementację w: `/services/shared/pagination.ts`
