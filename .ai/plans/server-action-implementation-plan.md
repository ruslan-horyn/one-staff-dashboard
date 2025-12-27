# Prompt: Plan implementacji Server Action

Jesteś doświadczonym architektem oprogramowania, którego zadaniem jest stworzenie szczegółowego planu wdrożenia Server Action w Next.js. Twój plan poprowadzi zespół programistów w skutecznym i poprawnym wdrożeniu tej akcji.

Zanim zaczniemy, zapoznaj się z poniższymi informacjami:

1. Specyfikacja Server Action:
<server_action_specification>
.ai/server-actions-plan.md
</server_action_specification>

2. Powiązane zasoby bazy danych:
<related_db_resources>
.ai/db-plan.md
</related_db_resources>

3. Definicje typów:
<type_definitions>
types/database.ts           <- Auto-generated Supabase types
types/[entity].ts           <- Entity types and DTOs
services/[module]/schemas.ts <- Zod schemas for validation
</type_definitions>

4. Tech stack:
<tech_stack>
@docs/tech-stack.md
</tech_stack>

5. Architektura projektu:
<directory_architecture>
@docs/directory-architecture.md
</directory_architecture>

6. Shared utilities:
<shared_utilities>
services/shared/
├── result.ts          # ActionResult<T>, success(), failure(), isSuccess(), isFailure()
├── errors.ts          # ErrorCodes, mapSupabaseError(), mapZodError(), mapAuthError()
├── auth.ts            # getSession(), requireSession(), AuthenticationError
├── action-wrapper.ts  # createAction() HOF wrapper
├── schemas.ts         # Shared Zod schemas (uuidSchema, phoneSchema, paginationSchema, etc.)
├── pagination.ts      # PaginatedResult<T>, PaginationMeta, calculateOffset, paginateResult, applyPaginationToQuery
└── index.ts           # Barrel exports
</shared_utilities>

7. Zasady implementacji:
<implementation_rules>

- Server Actions definiowane z dyrektywą "use server" na początku pliku
- Używaj `createAction()` HOF wrapper z `/services/shared/action-wrapper`
- Walidacja przez Zod z schematami w `/services/[module]/schemas.ts`
- Wykorzystuj shared schemas z `/services/shared/schemas.ts` (uuidSchema, phoneSchema, etc.)
- Obsługa błędów przez `ActionResult<T>` z `/services/shared/result`
- Rzucanie błędów Supabase - wrapper automatycznie mapuje je przez `mapSupabaseError()`
- Autoryzacja domyślnie włączona w `createAction()` (requireAuth: true)
- Klient Supabase i user przekazywane przez context w `createAction()`
</implementation_rules>

---

## Twoje zadanie

Stwórz kompleksowy plan wdrożenia Server Action. Przed dostarczeniem ostatecznego planu użyj znaczników <analysis>, aby przeanalizować informacje i nakreślić swoje podejście. W tej analizie upewnij się, że:

1. Podsumuj kluczowe punkty specyfikacji akcji
2. Wymień wymagane i opcjonalne parametry wejściowe
3. Określ schemat Zod do walidacji (nowy lub istniejący w /services/[module]/schemas.ts)
4. Zidentyfikuj shared schemas do wykorzystania z /services/shared/schemas.ts
5. Zastanów się, jak wyodrębnić logikę do service layer (/services/[module]/actions.ts)
6. Zaplanuj walidację danych wejściowych zgodnie ze schematem Zod
7. Określ sposób obsługi błędów i logowania (jeśli dotyczy audit log)
8. Zidentyfikuj wymagania autoryzacji (rola: Administrator vs Coordinator)
9. Nakreśl potencjalne scenariusze błędów i odpowiadające im kody z ErrorCodes
10. Identyfikacja potencjalnych zagrożeń bezpieczeństwa w oparciu o specyfikację server action i stack technologiczny.

---

## Format wyjściowy

Po przeprowadzeniu analizy utwórz szczegółowy plan wdrożenia w formacie markdown:

```markdown
# Server Action Implementation Plan: [Nazwa akcji]

## 1. Przegląd akcji
[Krótki opis celu i funkcjonalności Server Action]

## 2. Dane wejściowe
- Parametry:
  - Wymagane: [Lista wymaganych parametrów z typami]
  - Opcjonalne: [Lista opcjonalnych parametrów z typami]
- Schemat Zod: [Ścieżka do schematu lub definicja nowego]
- Shared schemas: [Lista wykorzystywanych shared schemas z /services/shared/schemas.ts]

## 3. Wykorzystywane typy

### Zasady wyboru typów:

| Kontekst | Źródło | Przykład |
|----------|--------|----------|
| **Input** | Zod schema → `z.infer<>` | `CreateWorkerInput` z `services/[module]/schemas.ts` |
| **Output (surowe dane)** | Database types | `Tables<'temporary_workers'>` z `types/database.ts` |
| **Output (z relacjami)** | DTO | `WorkerWithStats` z `types/worker.ts` |

### Dla tej akcji:
- Input Types: [Typy wejściowe - z infer Zod schema]
- Output Types: [Tables<'table_name'> dla prostego CRUD lub DTO dla danych z relacjami]
- Entities: [Powiązane encje bazodanowe]

## 4. Szczegóły odpowiedzi
- Success Response: ActionResult<T> z success: true i data: T
- Error Response: ActionResult<T> z success: false i error: ActionError

## 5. Przepływ danych
1. [Krok 1: createAction() waliduje input przez Zod schema]
2. [Krok 2: createAction() sprawdza autoryzację (jeśli requireAuth: true)]
3. [Krok 3: Handler otrzymuje validated input i context {supabase, user}]
4. [Krok 4: Operacje na Supabase - błędy rzucane i mapowane przez wrapper]
5. [Krok N: Zwrócenie danych - wrapper opakowuje w success()]

## 6. Względy bezpieczeństwa
- Autoryzacja: [Wymagana rola - Administrator/Coordinator lub requireAuth: false]
- Walidacja: [Reguły walidacji Zod]
- Sanityzacja: [Dane wymagające sanityzacji]

## 7. Obsługa błędów
| Scenariusz | ErrorCode | Komunikat | Działanie |
|------------|-----------|-----------|-----------|
| Brak autoryzacji | NOT_AUTHENTICATED | "You must be logged in..." | Przekierowanie do logowania |
| Brak uprawnień | FORBIDDEN | "You do not have permission..." | Zwrot błędu |
| Walidacja nieudana | VALIDATION_ERROR | Błędy Zod (fieldErrors) | Zwrot błędów formularza |
| Zasób nie istnieje | NOT_FOUND | "The requested resource..." | Zwrot błędu 404 |
| Duplikat | DUPLICATE_ENTRY | "A record with this..." | Zwrot błędu |
| Zależności | HAS_DEPENDENCIES | "This record cannot be deleted..." | Zwrot błędu |
| Błąd bazy danych | DATABASE_ERROR | "An unexpected database error..." | Log + zwrot błędu |

## 8. Rozważania dotyczące wydajności
[Potencjalne wąskie gardła i strategie optymalizacji]

## 9. Etapy wdrożenia

### 9.1. Schemat walidacji
```typescript
// /services/[module]/schemas.ts
import { z } from 'zod';
import { uuidSchema, phoneSchema } from '@/services/shared/schemas';

export const [actionName]Schema = z.object({
  id: uuidSchema,
  phone: phoneSchema,
  // ... pozostałe pola
});

export type [ActionName]Input = z.infer<typeof [actionName]Schema>;
```

### 9.2. Server Action - prosty CRUD (Tables<>)
```typescript
// /services/[module]/actions.ts
'use server';

import { createAction } from '@/services/shared';
import { [actionName]Schema, type [ActionName]Input } from './schemas';
import type { Tables } from '@/types/database';

// Używaj Tables<> gdy zwracasz surowe dane z jednej tabeli
type Worker = Tables<'temporary_workers'>;

export const createWorker = createAction<[ActionName]Input, Worker>(
  async (input, { supabase, user }) => {
    const { data, error } = await supabase
      .from('temporary_workers')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: [actionName]Schema }
);
```

### 9.3. Server Action - z relacjami (DTO)
```typescript
// /services/[module]/actions.ts
'use server';

import { createAction } from '@/services/shared';
import { getWorkerSchema, type GetWorkerInput } from './schemas';
import type { WorkerWithAssignments } from '@/types/worker';

// Używaj DTO gdy zwracasz dane z relacjami lub computed fields
export const getWorkerWithAssignments = createAction<GetWorkerInput, WorkerWithAssignments>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .from('temporary_workers')
      .select(`
        *,
        assignments:worker_assignments(
          *,
          position:open_positions(*)
        )
      `)
      .eq('id', input.id)
      .single();

    if (error) throw error;
    return data as WorkerWithAssignments;
  },
  { schema: getWorkerSchema }
);
```

### 9.4. Server Action bez autoryzacji (np. signIn)
```typescript
// /services/auth/actions.ts
'use server';

import { createAction } from '@/services/shared';
import { signInSchema, type SignInInput } from './schemas';

export const signIn = createAction<SignInInput, { user: User }>(
  async (input, { supabase }) => {
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw error; // Mapowane przez mapAuthError()
    return data;
  },
  { schema: signInSchema, requireAuth: false }
);
```

### 9.5. Integracja z formularzem (jeśli dotyczy)
```typescript
// Przykład użycia z react-hook-form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { [actionName]Schema, type [ActionName]Input } from '@/services/[module]/schemas';
import { [actionName] } from '@/services/[module]/actions';
import { isSuccess, isFailure } from '@/services/shared';

const form = useForm<[ActionName]Input>({
  resolver: zodResolver([actionName]Schema),
});

const onSubmit = async (data: [ActionName]Input) => {
  const result = await [actionName](data);

  if (isSuccess(result)) {
    // result.data jest typu Entity
    toast.success('Operation successful');
  } else {
    // result.error jest typu ActionError
    if (result.error.code === 'VALIDATION_ERROR') {
      // Mapowanie fieldErrors na formularz
      const fieldErrors = result.error.details?.fieldErrors as Record<string, string[]>;
      Object.entries(fieldErrors || {}).forEach(([field, messages]) => {
        form.setError(field as keyof [ActionName]Input, { message: messages[0] });
      });
    } else {
      toast.error(result.error.message);
    }
  }
};
```

### 9.6. Audit Log (jeśli dotyczy)
```typescript
// W handlerze akcji - logowanie do tabeli audit_log
const { error: auditError } = await supabase
  .from('audit_log')
  .insert({
    user_id: user?.id,
    action: 'CREATE_WORKER',
    entity_type: 'temporary_workers',
    entity_id: data.id,
    changes: input,
  });

if (auditError) {
  console.error('[Audit Log Error]', auditError);
  // Nie przerywaj operacji - audit log jest secondary
}
```
```

---

## Uwagi do implementacji

W całym planie upewnij się, że:

- Używasz `createAction()` HOF z `/services/shared/action-wrapper`
- Plik actions.ts ma dyrektywę `"use server"` na początku
- Walidacja odbywa się przez Zod schema przekazany do `createAction({ schema })`
- Autoryzacja jest domyślnie włączona (`requireAuth: true`)
- Klient Supabase i user są dostępne przez context: `{ supabase, user }`
- Błędy Supabase rzucasz przez `throw error` - wrapper mapuje je automatycznie
- Typy wejściowe inferowane z Zod: `z.infer<typeof schema>`
- Odpowiedzi mają typ `ActionResult<T>` - używaj `isSuccess()` i `isFailure()` do type narrowing
- Wykorzystujesz shared schemas z `/services/shared/schemas.ts` dla common fields
- Wykorzystujesz pagination helpers z `/services/shared/pagination.ts` dla paginacji
- Operacje wymagające audytu są logowane do tabeli `audit_log`
- Kod jest zgodny z konwencjami z CLAUDE.md

---

## Dostępne ErrorCodes

| Code | Opis |
|------|------|
| `NOT_AUTHENTICATED` | User is not logged in |
| `INVALID_CREDENTIALS` | Login credentials are incorrect |
| `SESSION_EXPIRED` | JWT token has expired |
| `FORBIDDEN` | User lacks permission |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Unique constraint violation |
| `HAS_DEPENDENCIES` | Cannot delete (foreign key) |
| `INVALID_DATE_RANGE` | End date before start date |
| `DATABASE_ERROR` | Unexpected database error |
| `INTERNAL_ERROR` | Unexpected application error |

---

## Dostępne Shared Schemas

| Schema | Opis |
|--------|------|
| `uuidSchema` | UUID validation |
| `phoneSchema` | Phone number (9-20 chars, digits/spaces/dashes) |
| `optionalPhoneSchema` | Optional phone (nullable) |
| `emailSchema` | Email validation |
| `optionalEmailSchema` | Optional email (nullable) |
| `searchSchema` | Optional trimmed search string |
| `userRoleSchema` | User role enum |
| `paginationSchema` | Page + pageSize with defaults |
| `sortOrderSchema` | 'asc' or 'desc' |
| `dateRangeSchema` | dateFrom/dateTo with ISO datetime |
| `dateOnlyRangeSchema` | startDate/endDate with ISO date |
| `baseFilterSchema` | pagination + search combined |

---

## Dostępne Pagination Helpers

Z `/services/shared/pagination.ts`:

| Helper | Opis |
|--------|------|
| `calculateOffset(page, pageSize)` | Converts page/pageSize to SQL offset |
| `calculateTotalPages(totalItems, pageSize)` | Calculates total pages |
| `createPaginationMeta(params)` | Creates full pagination metadata |
| `paginateResult(data, totalItems, page, pageSize)` | Wraps data in `PaginatedResult<T>` |
| `applyPaginationToQuery(query, page, pageSize)` | Adds `.range()` to Supabase query |

| Typ | Opis |
|-----|------|
| `PaginatedResult<T>` | Wrapper with `data: T[]` and `pagination: PaginationMeta` |
| `PaginationMeta` | Metadata: page, pageSize, totalItems, totalPages, hasNextPage, hasPreviousPage |

| Stała | Wartość |
|-------|---------|
| `DEFAULT_PAGE_SIZE` | 20 |
| `MAX_PAGE_SIZE` | 100 |

---

## Lokalizacja planu

Zapisz swój plan wdrożenia jako `.ai/[action-name]-implementation-plan.md`. Upewnij się, że plan jest szczegółowy, przejrzysty i zapewnia kompleksowe wskazówki dla zespołu programistów.
