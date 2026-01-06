# Weryfikacja kompletności UI Architecture względem Server Actions

## Context

Analityk dokumentacji projektu One Staff Dashboard - MVP dla agencji pracy tymczasowej. Projekt używa:
- Next.js 16 (App Router)
- Server Actions jako warstwa danych
- shadcn/ui dla komponentów
- Supabase (Auth + PostgreSQL)

Kluczowe założenia z PRD:
- Dwie role: Administrator i Koordynator
- **Administrator zarządza kontami Koordynatorów** (brak self-registration)
- Pracownicy tymczasowi NIE mają dostępu do systemu
- Logowanie przez username/password

Celem jest identyfikacja brakujących widoków UI dla zdefiniowanych server actions.

## Source Files

### Primary (wymagane):
- `docs/ui-architecture.md` - Architektura UI z listą widoków i komponentów
- `docs/server-actions-plan.md` - Plan server actions z listą wszystkich akcji
- `docs/prd.md` - User stories i wymagania biznesowe (weryfikacja kontekstu)

## Tasks

### Phase 1: Ekstrakcja danych

1. Przeczytać `docs/server-actions-plan.md` i wyekstrahować wszystkie server actions:
   - Nazwa akcji (np. `signIn`, `createWorker`)
   - Moduł (np. Auth, Clients, Workers)
   - Typ: mutation vs query
   - Czy wymaga dedykowanego widoku UI

2. Przeczytać `docs/ui-architecture.md` i wyekstrahować wszystkie widoki:
   - Ścieżka (np. `/login`, `/workers/new`)
   - Kluczowe komponenty
   - Powiązane server actions

3. Przeczytać `docs/prd.md` dla weryfikacji kontekstu biznesowego każdej akcji

### Phase 2: Mapowanie i analiza

1. Dla każdej server action określić wymaganie UI:

| Kategoria | Wymaganie UI | Przykłady |
|-----------|--------------|-----------|
| **Form Page** | Dedykowana strona z formularzem | resetPassword (forgot-password), updatePassword |
| **Admin Form** | Strona/modal w panelu admin | signUp (tworzenie konta przez admina) |
| **Modal/Dialog** | Modal w istniejącym widoku | createAssignment, endAssignment |
| **Inline Action** | Przycisk/akcja bez nowego widoku | signOut, deleteClient |
| **Query Only** | Brak UI - dane dla innych widoków | getCurrentUser, getClients |
| **Settings Page** | Strona ustawień/profilu | updateProfile |

2. Sprawdzić czy każda wymagana forma UI istnieje w ui-architecture.md

### Phase 3: Generowanie raportu

1. Stworzyć tabelę mapowania: Server Action → Widok UI
2. Wylistować brakujące widoki z rekomendacjami
3. Zweryfikować z PRD czy brak jest uzasadniony

## Output Format

### Raport weryfikacji

```markdown
# Raport: UI Architecture vs Server Actions

## Podsumowanie

- Server Actions ogółem: X
- Z pokryciem UI: Y
- Bez pokrycia UI (wymagające): Z
- Procent kompletności: N%

## Mapowanie Server Actions → UI

### Auth Module

| Action | Typ | Wymaga UI | Widok | Status | Uwagi PRD |
|--------|-----|-----------|-------|--------|-----------|
| signIn | mutation | Form Page | `/login` | ✅ OK | US-001 |
| signUp | mutation | Admin Form | BRAK | ❌ BRAK | Admin tworzy konta (3.1) |
| signOut | mutation | Inline | User Menu | ✅ OK | - |
| resetPassword | mutation | Form Page | BRAK | ❌ BRAK | Link w /login |
| updatePassword | mutation | Form Page | BRAK | ❌ BRAK | Callback z maila |
| updateProfile | mutation | Settings Page | BRAK | ❌ BRAK | User Menu → Profil |
| getCurrentUser | query | Query Only | - | ✅ N/A | - |

### [Kolejne moduły...]

## Brakujące widoki

### 1. Forgot Password (`/forgot-password`)
- **Server Action:** `resetPassword`
- **Wymagane komponenty:** ForgotPasswordForm, EmailInput, SubmitButton
- **Priorytet:** Średni
- **Uzasadnienie:** Login page ma "Link do resetowania hasła", ale brak docelowej strony
- **Sugerowana ścieżka:** `/forgot-password` w grupie `(auth)`

### 2. Reset Password Callback (`/reset-password`)
- **Server Action:** `updatePassword`
- **Wymagane komponenty:** ResetPasswordForm, PasswordInput, SubmitButton
- **Priorytet:** Średni
- **Uzasadnienie:** Po kliknięciu linku z maila użytkownik musi ustawić nowe hasło
- **Sugerowana ścieżka:** `/reset-password` w grupie `(auth)`

### 3. Profile/Settings (`/profile` lub `/settings`)
- **Server Action:** `updateProfile`
- **Wymagane komponenty:** ProfileForm, FormActions
- **Priorytet:** Niski
- **Uzasadnienie:** User Menu pokazuje "Profil" ale brak widoku
- **Sugerowana ścieżka:** `/profile` w grupie `(dashboard)`

### 4. Admin: Create User (modal lub strona)
- **Server Action:** `signUp`
- **Wymagane komponenty:** CreateUserForm, RoleSelect
- **Priorytet:** Wysoki
- **Uzasadnienie:** PRD 3.1: "Administrator manages Coordinator accounts"
- **Sugerowana forma:** Modal `CreateUserModal` lub strona `/admin/users`

## Rekomendacje

1. [Konkretna rekomendacja]
2. [Konkretna rekomendacja]
```

## Success Criteria

### Measurable Goals
- [ ] 100% server actions przeanalizowanych i skategoryzowanych
- [ ] Każda akcja wymagająca UI ma określony status (OK/BRAK)
- [ ] Każdy brak zweryfikowany z PRD
- [ ] Raport zawiera procent kompletności

### Validation Method
- Porównać liczbę server actions w raporcie z liczbą w źródle
- Sprawdzić czy rekomendacje są spójne z PRD i user stories
- Zweryfikować czy "Link do resetowania hasła" w Login ma docelową stronę

## Constraints

- Analizować TYLKO server actions zdefiniowane w dokumentach
- Queries (getX) zazwyczaj NIE wymagają dedykowanego widoku
- Modal/Dialog to też forma pokrycia UI - nie oznaczać jako BRAK
- Weryfikować kontekst biznesowy z PRD przed oznaczeniem jako BRAK
- `signUp` to Admin tworzy konta, NIE self-registration
- Zachować język polski w raporcie
- Nie modyfikować plików źródłowych

## Examples

### Przykład poprawnego mapowania

<example_mapping>
| Action | Typ | Wymaga UI | Widok | Status | Uwagi PRD |
|--------|-----|-----------|-------|--------|-----------|
| signIn | mutation | Form Page | `/login` | ✅ OK | US-001 |
| signUp | mutation | Admin Form | BRAK | ❌ BRAK | Admin tworzy konta (3.1) |
| signOut | mutation | Inline | User Menu | ✅ OK | - |
| createWorker | mutation | Form Page | `/workers/new` | ✅ OK | US-004 |
| getWorkers | query | Query Only | - | ✅ N/A | - |
</example_mapping>

### Przykład rekomendacji

<example_recommendation>
### Forgot Password (`/forgot-password`)
- **Server Action:** `resetPassword`
- **Wymagane komponenty:**
  - `ForgotPasswordForm` (Client) - formularz z react-hook-form
  - `EmailInput` - input email
  - `SubmitButton` - przycisk z loading state
- **Priorytet:** Średni
- **Uzasadnienie:** W sekcji 2.1 Login (ui-architecture.md) jest "Link do resetowania hasła", ale brak zdefiniowanej strony docelowej. Bez tego widoku link nie ma gdzie prowadzić.
- **Sugerowana ścieżka:** `/forgot-password` w grupie `(auth)`
- **UX:** Formularz z jednym polem (email), komunikat sukcesu bez ujawniania czy email istnieje (bezpieczeństwo)
</example_recommendation>
