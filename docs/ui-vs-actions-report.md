# Raport: UI Architecture vs Server Actions

Data wygenerowania: 2026-01-06

## Podsumowanie

| Metryka | Wartość |
|---------|---------|
| Server Actions ogółem | 24 |
| Wymaga UI (mutations bez inline) | 18 |
| Z pokryciem UI | 14 |
| **Bez pokrycia UI** | **4** |
| Procent kompletności | **78%** |

---

## Mapowanie Server Actions → UI

### Auth Module (✅ IMPLEMENTED)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `signIn` | mutation | Form Page | `/login` (LoginForm) | ✅ OK | US-001 |
| `signUp` | mutation | Admin Form | BRAK | ❌ BRAK | PRD 3.1: Admin zarządza kontami |
| `signOut` | mutation | Inline | User Menu dropdown | ✅ OK | - |
| `updateProfile` | mutation | Settings Page | BRAK | ❌ BRAK | User Menu → "Profil" bez widoku |
| `getCurrentUser` | query | Query Only | - | ✅ N/A | - |
| `resetPassword` | mutation | Form Page | BRAK | ❌ BRAK | Login ma link, brak strony |
| `updatePassword` | mutation | Form Page | BRAK | ❌ BRAK | Callback po resecie |

### Clients Module (✅ IMPLEMENTED)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `createClient` | mutation | Form Page | `/clients/new` (ClientForm) | ✅ OK | US-002 |
| `getClient` | query | Query Only | - | ✅ N/A | - |
| `getClients` | query | Query Only | - | ✅ N/A | - |
| `updateClient` | mutation | Form Page | `/clients/[id]` (ClientForm) | ✅ OK | US-002 |
| `deleteClient` | mutation | Dialog | DeleteClientDialog | ✅ OK | US-002 |

### WorkLocations Module (⏳ TODO)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `createWorkLocation` | mutation | Form Page | `/locations/new` (LocationForm) | ✅ OK | US-003 |
| `updateWorkLocation` | mutation | Form Page | `/locations/[id]` (LocationForm) | ✅ OK | US-003 |
| `deleteWorkLocation` | mutation | Dialog | Dialog w `/locations` | ✅ OK | - |
| `getWorkLocation` | query | Query Only | - | ✅ N/A | - |
| `getWorkLocations` | query | Query Only | - | ✅ N/A | - |

### Positions Module (⏳ TODO)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `createPosition` | mutation | Inline Form | PositionsManager, AddPositionInline | ✅ OK | US-006 |
| `updatePosition` | mutation | Inline Form | PositionRow (inline edit) | ✅ OK | - |
| `deletePosition` | mutation | Dialog | PositionRow (delete action) | ✅ OK | - |
| `getPosition` | query | Query Only | - | ✅ N/A | - |
| `getPositions` | query | Query Only | - | ✅ N/A | - |

### Workers Module (⏳ TODO)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `createWorker` | mutation | Form Page | `/workers/new` (WorkerForm) | ✅ OK | US-004 |
| `updateWorker` | mutation | Form Page | `/workers/[id]` (WorkerForm) | ✅ OK | US-004 |
| `deleteWorker` | mutation | Dialog | DeleteWorkerDialog | ✅ OK | - |
| `getWorker` | query | Query Only | - | ✅ N/A | - |
| `getWorkers` | query | Query Only | - | ✅ N/A | - |

### Assignments Module (⏳ TODO)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `createAssignment` | mutation | Modal | CreateAssignmentModal (Board) | ✅ OK | US-006 |
| `endAssignment` | mutation | Modal | EndAssignmentModal (Board) | ✅ OK | US-008 |
| `cancelAssignment` | mutation | Dialog | CancelAssignmentDialog (Board) | ✅ OK | US-009 |
| `getAssignment` | query | Query Only | - | ✅ N/A | - |
| `getAssignments` | query | Query Only | - | ✅ N/A | - |

### Reports Module (⏳ TODO)

| Action | Typ | Wymaga UI | Widok w ui-architecture | Status | Uwagi PRD |
|--------|-----|-----------|-------------------------|--------|-----------|
| `generateHoursReport` | mutation | Page | `/reports` (ReportFilters, ReportTable) | ✅ OK | US-010 |
| `exportReportToCsv` | mutation | Button | ExportButton na `/reports` | ✅ OK | US-010 |

---

## Brakujące widoki

### 1. Forgot Password (`/forgot-password`)

| Atrybut | Wartość |
|---------|---------|
| **Server Action** | `resetPassword` |
| **Priorytet** | Średni |
| **Grupa routingu** | `(auth)` |

**Uzasadnienie:**
W sekcji 2.1 Login (ui-architecture.md) zdefiniowano "Link do resetowania hasła" jako element UI, ale brak strony docelowej. Użytkownik klikający ten link nie ma gdzie trafić.

**Wymagane komponenty:**
- `ForgotPasswordForm` (Client) - formularz z react-hook-form
- `EmailInput` - pole email
- `SubmitButton` - przycisk z loading state (useFormStatus)

**UX:**
- Formularz z jednym polem (email)
- Komunikat sukcesu BEZ ujawniania czy email istnieje (bezpieczeństwo - zgodne z server action)
- Link powrotny do `/login`

**Dostępność:**
- `aria-describedby` dla pola email
- `aria-live="polite"` dla komunikatu sukcesu

---

### 2. Reset Password Callback (`/reset-password`)

| Atrybut | Wartość |
|---------|---------|
| **Server Action** | `updatePassword` |
| **Priorytet** | Średni |
| **Grupa routingu** | `(auth)` |

**Uzasadnienie:**
Po kliknięciu linku z maila (wysłanego przez `resetPassword`) użytkownik musi ustawić nowe hasło. Supabase Auth przekierowuje na callback URL z tokenem sesji.

**Wymagane komponenty:**
- `ResetPasswordForm` (Client) - formularz z react-hook-form
- `PasswordInput` - input z toggle visibility (x2: nowe hasło + potwierdzenie)
- `SubmitButton` - przycisk z loading state

**UX:**
- Walidacja: min 8 znaków, oba pola identyczne
- Po sukcesie: przekierowanie na `/login` z toast "Hasło zostało zmienione"
- Obsługa wygasłego tokenu: komunikat + link do `/forgot-password`

**Bezpieczeństwo:**
- Token z URL obsługiwany przez Supabase Auth
- Sesja tymczasowa tylko do zmiany hasła

---

### 3. Profile / Settings (`/profile`)

| Atrybut | Wartość |
|---------|---------|
| **Server Action** | `updateProfile` |
| **Priorytet** | Niski |
| **Grupa routingu** | `(dashboard)` |

**Uzasadnienie:**
W sekcji 4.4 User Menu (ui-architecture.md) zdefiniowano opcję "Profil" w dropdown menu, ale brak widoku docelowego. Server action `updateProfile` pozwala zmienić firstName i lastName.

**Wymagane komponenty:**
- `ProfileForm` (Client) - formularz z react-hook-form
- `FormField` - pola: Imię, Nazwisko (readonly: Email, Rola)
- `FormActions` - Zapisz/Anuluj

**Kluczowe informacje do wyświetlenia:**
- Dane użytkownika: Imię, Nazwisko (edytowalne)
- Email (readonly - z auth)
- Rola (readonly - admin/coordinator)
- Data ostatniego logowania (opcjonalnie)

**UX:**
- Pre-filled z danymi z `getCurrentUser`
- Toast po zapisie "Profil zaktualizowany"
- Przycisk "Zmień hasło" → link do dedykowanej strony (opcjonalnie)

---

### 4. Admin: Zarządzanie użytkownikami

| Atrybut | Wartość |
|---------|---------|
| **Server Action** | `signUp` |
| **Priorytet** | Wysoki |
| **Forma** | Modal lub dedykowana strona |

**Uzasadnienie:**
PRD sekcja 3.1: "Administrator manages Coordinator accounts". Server action `signUp` jest zaimplementowany, ale brak UI do tworzenia kont przez admina. Bez tego admin nie może dodawać koordynatorów.

**Opcja A: Modal `CreateUserModal`**
- Wywoływany z User Menu (tylko dla admina)
- Lub z dedykowanej sekcji w nawigacji

**Opcja B: Strona `/admin/users`**
- Lista użytkowników (profiles)
- Przycisk "Dodaj użytkownika"
- Możliwość dezaktywacji kont

**Wymagane komponenty (obie opcje):**
- `CreateUserForm` (Client) - formularz z react-hook-form
- Pola: Email, Hasło tymczasowe, Imię, Nazwisko
- `RoleSelect` - wybór roli (admin/coordinator) - opcjonalnie jeśli tylko koordynatorzy

**Bezpieczeństwo:**
- Widoczne TYLKO dla roli admin
- RLS na poziomie bazy danych
- Explicit role check w server action

---

## Rekomendacje

### Priorytet Wysoki

1. **Dodać Admin: Zarządzanie użytkownikami**
   - Bez tego admin nie może tworzyć kont koordynatorów (core PRD requirement)
   - Sugestia: Najpierw modal `CreateUserModal`, potem rozbudowa do `/admin/users`

### Priorytet Średni

2. **Dodać `/forgot-password`**
   - Login page odwołuje się do linku resetowania - musi mieć cel
   - Prosta strona z jednym polem

3. **Dodać `/reset-password`**
   - Wymagane dla kompletności flow resetowania hasła
   - Callback dla Supabase Auth

### Priorytet Niski

4. **Dodać `/profile`**
   - User Menu pokazuje "Profil" - powinien gdzieś prowadzić
   - Można odłożyć na post-MVP jeśli brak czasu

---

## Dodatkowe obserwacje

### Spójność z PRD

| Wymaganie PRD | Status UI |
|---------------|-----------|
| US-001: System Login | ✅ `/login` zdefiniowany |
| US-002: Client Management | ✅ `/clients/*` zdefiniowane |
| US-003: Work Location Management | ✅ `/locations/*` zdefiniowane |
| US-004: Worker Management | ✅ `/workers/*` zdefiniowane |
| US-005: Worker List + Filters | ✅ Board zdefiniowany |
| US-006: Create Assignment | ✅ CreateAssignmentModal |
| US-007: Assignment Details | ✅ ExpandableRow |
| US-008: End Assignment | ✅ EndAssignmentModal |
| US-009: Cancel Assignment | ✅ CancelAssignmentDialog |
| US-010: Reports | ✅ `/reports` zdefiniowany |
| **PRD 3.1: Admin manages accounts** | ❌ BRAK UI |

### Brakujące w PRD ale zaimplementowane w Server Actions

- `resetPassword` / `updatePassword` - standardowe flow auth, powinno być
- `updateProfile` - nice-to-have, niski priorytet

---

## Podsumowanie akcji

| Akcja | Odpowiedzialny | Effort |
|-------|----------------|--------|
| Dodać widok Admin: Create User | Dev | ~4h |
| Dodać widok `/forgot-password` | Dev | ~2h |
| Dodać widok `/reset-password` | Dev | ~2h |
| Dodać widok `/profile` | Dev | ~3h |
| **Suma** | | **~11h** |
