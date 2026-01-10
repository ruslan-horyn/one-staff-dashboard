# Podsumowanie fazy: Dodanie organizations

## Status: ZAKOŃCZONO

Data: 2026-01-10

## Wykonane zmiany

### 1. Migracja bazy danych

Zastosowano migrację `add_organizations_and_auth_hooks` zawierającą:

| Element | Opis |
|---------|------|
| Tabela `organizations` | `id`, `name`, `created_at`, `updated_at` |
| Kolumna `profiles.organization_id` | FK do `organizations`, NULLABLE |
| Trigger `handle_new_user` | Tworzy organizację i profil przy rejestracji |
| Auth Hook `custom_access_token_hook` | Wbudowuje `user_role` i `organization_id` w JWT |
| Funkcja `user_role()` | Odczytuje rolę z JWT (nie z DB) |
| Funkcja `user_organization_id()` | Odczytuje organization_id z JWT |
| Polityki RLS | Dla `organizations` i zaktualizowane dla `profiles` |

### 2. Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `services/auth/schemas.ts` | Dodano `organizationName` do `signUpSchema` |
| `services/auth/actions.ts` | Przekazanie `organization_name` do `user_metadata` |
| `types/database.ts` | Wygenerowane typy z nowymi tabelami/kolumnami |

### 3. Wymagany krok manualny

**Włącz Auth Hook w Supabase Dashboard:**
- URL: https://supabase.com/dashboard/project/kbyvntodztrpjwvvrfhg/auth/hooks
- Typ: "Custom access token"
- Funkcja: `public.custom_access_token_hook`

---

## Kontekst dla następnej fazy (generowanie schematów)

### Nowe typy do uwzględnienia

```typescript
// types/database.ts - tabela organizations
organizations: {
  Row: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }
}

// types/database.ts - rozszerzenie profiles
profiles: {
  Row: {
    // ... istniejące pola
    organization_id: string | null;  // NOWE
  }
}
```

### Nowe/zaktualizowane schematy Zod

```typescript
// services/auth/schemas.ts - zaktualizowany signUpSchema
export const signUpSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  organizationName: z.string().trim().min(1).max(255),  // NOWE
});

// services/organizations/schemas.ts - NOWY PLIK
export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(255),
});

export const organizationIdSchema = z.object({
  id: z.string().uuid('Invalid organization ID'),
});
```

### JWT Custom Claims (dostępne po włączeniu Auth Hook)

```typescript
interface JWTCustomClaims {
  user_role: 'admin' | 'coordinator';
  organization_id: string;
}

// Dostęp w kliencie:
import { jwtDecode } from 'jwt-decode';
const jwt = jwtDecode(session.access_token);
const userRole = jwt.user_role;
const orgId = jwt.organization_id;
```

### Nowe funkcje RPC w bazie

| Funkcja | Opis |
|---------|------|
| `user_organization_id()` | Zwraca UUID organizacji z JWT |
| `user_role()` | Zwraca rolę z JWT (zaktualizowana) |

---

## Uwagi dla przyszłych faz

1. **Multi-tenancy danych:** Obecna implementacja NIE izoluje danych biznesowych (clients, work_locations, etc.) per organizację. Jeśli potrzebne, wymaga dodania `organization_id` do wszystkich tabel biznesowych.

2. **Dodawanie użytkowników do organizacji:** Obecnie każda rejestracja tworzy NOWĄ organizację. Funkcjonalność zapraszania użytkowników do istniejącej organizacji wymaga osobnej implementacji.

3. **Aktualizacja nazwy organizacji:** Dostępne tylko dla adminów (RLS policy `organizations_update`).
