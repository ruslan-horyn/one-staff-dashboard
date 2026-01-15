# Architektura UI dla One Staff Dashboard

## 1. Przegląd struktury UI

One Staff Dashboard to wewnętrzna aplikacja webowa MVP dla agencji pracy tymczasowej. Architektura UI opiera się na następujących założeniach:

- **Next.js 16 App Router** z Server Components jako domyślnymi
- **shadcn/ui** jako biblioteka komponentów bazowych
- **@tanstack/react-table** dla zaawansowanych tabel z sortowaniem i rozwijalnymi wierszami
- **react-hook-form + Zod** dla walidacji formularzy
- **Zustand** minimalnie - tylko dla ephemeral UI state (sidebar, modals)
- **URL jako source of truth** dla filtrów i wyszukiwania

### Podział ról

| Rola | Dostęp |
|------|--------|
| **Administrator** | Pełny dostęp + zarządzanie klientami i lokalizacjami |
| **Koordynator** | Board, Workers, Assignments, Reports |

### Architektura komponentów

```
Server Components (domyślne)
├── Layouts, listy, dane statyczne
└── Pobieranie danych przez Server Actions

Client Components ('use client')
├── Formularze z interaktywnością
├── Tabele z sortowaniem/filtrowaniem
├── Modals i dialogi
└── Komponenty używające hooks
```

---

## 2. Lista widoków

### 2.1. Login

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/login` |
| **Grupa routingu** | `(auth)` |
| **Cel** | Uwierzytelnienie użytkownika do systemu |

**Kluczowe informacje do wyświetlenia:**

- Formularz logowania (email, hasło)
- Komunikaty błędów walidacji
- Link do resetowania hasła

**Kluczowe komponenty:**

- `LoginForm` (Client) - formularz z react-hook-form
- `PasswordInput` - input z toggle visibility
- `SubmitButton` - przycisk z loading state (useFormStatus)

**UX:**

- Walidacja real-time pól formularza
- Loading spinner podczas wysyłania
- Autofocus na polu email
- Przekierowanie na Board po sukcesie

**Dostępność:**

- `aria-invalid` dla błędnych pól
- `aria-describedby` łączące pole z komunikatem błędu
- `aria-live="polite"` dla komunikatów błędów

**Bezpieczeństwo:**

- Server Action bez `requireAuth`
- Rate limiting (Supabase Auth)
- Brak ujawniania czy email istnieje

---

### 2.2. Board (Widok główny)

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/` (dashboard root) |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Centralny widok operacyjny - zarządzanie przypisaniami pracowników |

**Kluczowe informacje do wyświetlenia:**

- Lista pracowników tymczasowych
- Kolumny: Imię i nazwisko, Przypisane miejsca pracy, Godziny pracy, Suma godzin
- Rozwijane szczegóły przypisań dla każdego pracownika
- Status przypisań (zaplanowane, aktywne, zakończone)

**Kluczowe komponenty:**

- `WorkersBoardTable` (Client) - @tanstack/react-table z expandable rows
- `SearchInput` (Client) - debounced search (300ms) z URL state
- `AvailabilityFilter` (Client) - DateTimePicker do filtrowania dostępności
- `ExpandedAssignmentRow` (Client) - lista przypisań w rozwinietym wierszu
- `AssignmentActions` (Client) - przyciski akcji (Zakończ, Anuluj)
- `CreateAssignmentModal` (Client) - modal tworzenia przypisania
- `EndAssignmentModal` (Client) - modal kończenia pracy
- `CancelAssignmentDialog` (Client) - dialog potwierdzenia anulowania

**UX:**

- Sortowanie przez kliknięcie nagłówka kolumny
- Wyszukiwanie z debounce - wyniki filtrowane server-side
- Filtr "Dostępny od" pokazuje tylko pracowników bez konfliktów
- Rozwinięcie wiersza jednym kliknięciem
- Optimistic updates przy akcjach na przypisaniach
- Toast notification po każdej akcji

**Dostępność:**

- `aria-expanded` dla rozwijalnych wierszy
- `aria-sort` dla sortowanych kolumn
- Keyboard navigation w tabeli
- Focus trap w modalach
- `role="alert"` dla komunikatów akcji

**Bezpieczeństwo:**

- Dane pobierane przez Server Action z RLS
- Akcje weryfikowane przez `createAction` wrapper

---

### 2.3. Lista pracowników

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/workers` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Zarządzanie bazą pracowników tymczasowych |

**Kluczowe informacje do wyświetlenia:**

- Lista wszystkich pracowników z paginacją
- Kolumny: Imię, Nazwisko, Telefon, Data dodania
- Liczba aktywnych przypisań

**Kluczowe komponenty:**

- `WorkersTable` (Client) - tabela z sortowaniem i paginacją
- `SearchInput` (Client) - wyszukiwanie po imieniu/nazwisku/telefonie
- `PageHeader` (Server) - tytuł + przycisk "Dodaj pracownika"
- `Pagination` (Client) - nawigacja stron

**UX:**

- Server-side pagination (DEFAULT_PAGE_SIZE: 20)
- Wyszukiwanie przez URL params (shareable links)
- Loading skeleton podczas ładowania
- Empty state z CTA gdy brak pracowników

**Dostępność:**

- Nawigacja klawiszowa w tabeli
- `aria-label` dla przycisków akcji
- Opisowe linki w paginacji

**Bezpieczeństwo:**

- Dostęp dla wszystkich zalogowanych (Admin i Coordinator)

---

### 2.4. Formularz pracownika (Nowy/Edycja)

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/workers/new`, `/workers/[id]` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Tworzenie i edycja danych pracownika |

**Kluczowe informacje do wyświetlenia:**

- Formularz: Imię, Nazwisko, Telefon
- W trybie edycji: aktualne dane pracownika
- Historia przypisań (tylko w edycji)

**Kluczowe komponenty:**

- `WorkerForm` (Client) - react-hook-form z zodResolver
- `PhoneInput` (Client) - input z formatowaniem numeru
- `FormActions` (Client) - Zapisz/Anuluj z loading states
- `DeleteWorkerDialog` (Client) - potwierdzenie usunięcia (soft delete)
- `WorkerAssignmentsHistory` (Server) - lista przeszłych przypisań

**UX:**

- Walidacja Zod z komunikatami
- Przycisk Zapisz disabled podczas submitu
- Sukces → przekierowanie na listę z toast
- W edycji: skeleton podczas ładowania danych

**Dostępność:**

- `aria-required` dla wymaganych pól
- `aria-invalid` + `aria-describedby` dla błędów
- Focus na pierwszym polu przy otwarciu

**Bezpieczeństwo:**

- Unikalność telefonu sprawdzana przez DB constraint
- Soft delete zamiast hard delete

---

### 2.5. Lista klientów (Admin)

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/clients` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Zarządzanie klientami agencji |

**Kluczowe informacje do wyświetlenia:**

- Lista klientów z paginacją
- Kolumny: Nazwa, Email, Telefon, Adres, Liczba lokalizacji
- Akcje: Edytuj, Usuń

**Kluczowe komponenty:**

- `ClientsTable` (Client) - tabela z sortowaniem
- `SearchInput` (Client) - wyszukiwanie po nazwie/email
- `PageHeader` (Server) - tytuł + "Dodaj klienta"
- `DeleteClientDialog` (Client) - z walidacją zależności

**UX:**

- Informacja o liczbie powiązanych lokalizacji
- Blokada usunięcia gdy istnieją lokalizacje
- Empty state zachęcający do dodania pierwszego klienta

**Dostępność:**

- Komunikaty o błędach usuwania w `aria-live` region

**Bezpieczeństwo:**

- **Tylko Admin** - sprawdzanie roli w proxy.ts i Server Action
- Soft delete z sprawdzeniem HAS_DEPENDENCIES

---

### 2.6. Formularz klienta (Nowy/Edycja) - Admin

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/clients/new`, `/clients/[id]` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Tworzenie i edycja danych klienta |

**Kluczowe informacje do wyświetlenia:**

- Formularz: Nazwa (wymagane), Email, Telefon, Adres
- W edycji: lista powiązanych miejsc pracy

**Kluczowe komponenty:**

- `ClientForm` (Client) - formularz z walidacją
- `ClientLocationsTable` (Server) - lista lokalizacji klienta
- `FormActions` (Client) - Zapisz/Anuluj
- `DeleteClientSection` (Client) - sekcja usuwania z ostrzeżeniami

**UX:**

- Walidacja email/telefon w czasie rzeczywistym
- W edycji: quick link do dodania lokalizacji
- Ostrzeżenie przed usunięciem z lokalizacjami

**Dostępność:**

- Jasna hierarchia nagłówków
- Opisowe labele dla wszystkich pól

**Bezpieczeństwo:**

- Tylko Admin - RLS + explicit role check

---

### 2.7. Lista lokalizacji (Admin)

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/locations` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Zarządzanie miejscami pracy |

**Kluczowe informacje do wyświetlenia:**

- Lista lokalizacji z paginacją
- Kolumny: Nazwa obiektu, Klient, Adres, Liczba stanowisk
- Filtr po kliencie

**Kluczowe komponenty:**

- `LocationsTable` (Client) - tabela z sortowaniem
- `ClientFilter` (Client) - dropdown filtrowania po kliencie
- `SearchInput` (Client) - wyszukiwanie
- `PageHeader` (Server) - tytuł + "Dodaj lokalizację"

**UX:**

- Filtr klienta zachowany w URL
- Grupowanie po kliencie (opcjonalne)
- Szybki dostęp do edycji stanowisk

**Dostępność:**

- Combobox dla filtra klienta z keyboard support

**Bezpieczeństwo:**

- Tylko Admin

---

### 2.8. Formularz lokalizacji (Nowy/Edycja) - Admin

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/locations/new`, `/locations/[id]` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Tworzenie i edycja miejsc pracy |

**Kluczowe informacje do wyświetlenia:**

- Formularz: Klient (select), Nazwa obiektu, Adres, Email, Telefon
- W edycji: lista stanowisk z możliwością inline edit

**Kluczowe komponenty:**

- `LocationForm` (Client) - formularz z walidacją
- `ClientSelect` (Client) - dropdown wyboru klienta
- `PositionsManager` (Client) - lista stanowisk z CRUD
- `AddPositionInline` (Client) - inline form dla nowego stanowiska
- `PositionRow` (Client) - wiersz stanowiska z edit/delete

**UX:**

- Klient preselected jeśli przyszliśmy z widoku klienta
- Inline dodawanie stanowisk bez odświeżania
- Toggle is_active dla stanowisk

**Dostępność:**

- `aria-expanded` dla sekcji stanowisk
- Inline edycja z keyboard support

**Bezpieczeństwo:**

- Tylko Admin
- Stanowiska mogą edytować wszyscy zalogowani

---

### 2.9. Raporty godzin

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/reports` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Generowanie raportów przepracowanych godzin |

**Kluczowe informacje do wyświetlenia:**

- Filtry: Zakres dat, Klient (opcjonalnie)
- Tabela wyników: Pracownik, Miejsce pracy, Klient, Suma godzin
- Podsumowanie całkowite

**Kluczowe komponenty:**

- `ReportFilters` (Client) - DateRangePicker + ClientSelect
- `ReportTable` (Client) - tabela wyników z sortowaniem
- `ReportSummary` (Server) - podsumowanie sumy godzin
- `ExportButton` (Client) - przycisk eksportu CSV
- `GenerateReportButton` (Client) - przycisk generowania

**UX:**

- Domyślny zakres: bieżący miesiąc
- Loading skeleton podczas generowania
- Empty state gdy brak danych w zakresie
- Eksport generuje plik z datą w nazwie

**Dostępność:**

- DateRangePicker z keyboard navigation
- Tabela z prawidłowymi nagłówkami
- Przycisk eksportu z `aria-label` opisującym format

**Bezpieczeństwo:**

- Dostęp dla wszystkich zalogowanych
- Dane filtrowane przez RLS

---

### 2.10. Forgot Password

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/forgot-password` |
| **Grupa routingu** | `(auth)` |
| **Cel** | Zainicjowanie procesu resetowania hasła |

**Kluczowe informacje do wyświetlenia:**

- Formularz z polem email
- Komunikat sukcesu (bez ujawniania czy email istnieje)
- Link powrotny do logowania

**Kluczowe komponenty:**

- `ForgotPasswordForm` (Client) - formularz z react-hook-form
- `EmailInput` - pole email
- `SubmitButton` - przycisk z loading state (useFormStatus)

**UX:**

- Formularz z jednym polem (email)
- Po submit: komunikat "Sprawdź swoją skrzynkę email"
- Loading spinner podczas wysyłania
- Link powrotny do `/login`

**Dostępność:**

- `aria-describedby` dla pola email
- `aria-live="polite"` dla komunikatu sukcesu

**Bezpieczeństwo:**

- Server Action bez `requireAuth`
- Rate limiting (Supabase Auth)
- Brak ujawniania czy email istnieje w systemie

---

### 2.11. Reset Password Callback

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/reset-password` |
| **Grupa routingu** | `(auth)` |
| **Cel** | Ustawienie nowego hasła po resecie |

**Kluczowe informacje do wyświetlenia:**

- Formularz z polami: nowe hasło, potwierdzenie hasła
- Komunikaty walidacji
- Obsługa wygasłego tokenu

**Kluczowe komponenty:**

- `ResetPasswordForm` (Client) - formularz z react-hook-form
- `PasswordInput` - input z toggle visibility (x2)
- `SubmitButton` - przycisk z loading state

**UX:**

- Walidacja: min 8 znaków, oba pola identyczne
- Po sukcesie: przekierowanie na `/login` z toast "Hasło zostało zmienione"
- Obsługa wygasłego tokenu: komunikat + link do `/forgot-password`

**Dostępność:**

- `aria-invalid` dla błędnych pól
- `aria-describedby` łączące pole z komunikatem błędu

**Bezpieczeństwo:**

- Token z URL obsługiwany przez Supabase Auth
- Sesja tymczasowa tylko do zmiany hasła

---

### 2.12. Profile / Settings

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/profile` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Edycja danych profilowych użytkownika |

**Kluczowe informacje do wyświetlenia:**

- Dane użytkownika: Imię, Nazwisko (edytowalne)
- Email (readonly)
- Rola (readonly)
- Data ostatniego logowania (opcjonalnie)

**Kluczowe komponenty:**

- `ProfileForm` (Client) - formularz z react-hook-form
- `FormField` - pola formularza
- `FormActions` - Zapisz/Anuluj z loading states

**UX:**

- Pre-filled z danymi z `getCurrentUser`
- Toast po zapisie "Profil zaktualizowany"
- Przycisk Zapisz disabled podczas submitu

**Dostępność:**

- `aria-required` dla wymaganych pól
- `aria-readonly` dla pól tylko do odczytu

**Bezpieczeństwo:**

- Wymaga uwierzytelnienia
- Użytkownik może edytować tylko swoje dane

---

### 2.13. Admin: User Management (Lista)

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/admin/users` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Zarządzanie kontami użytkowników systemu |

**Kluczowe informacje do wyświetlenia:**

- Lista użytkowników z paginacją
- Kolumny: Imię i Nazwisko, Email, Rola, Status (aktywny/nieaktywny), Ostatnie logowanie
- Akcje: Dezaktywuj/Aktywuj

**Kluczowe komponenty:**

- `UsersTable` (Client) - tabela z sortowaniem i paginacją
- `SearchInput` (Client) - wyszukiwanie po imieniu/email
- `PageHeader` (Server) - tytuł + przycisk "Dodaj użytkownika"
- `Pagination` (Client) - nawigacja stron
- `UserStatusBadge` (Client) - badge ze statusem (aktywny/nieaktywny)
- `DeactivateUserDialog` (Client) - dialog potwierdzenia dezaktywacji

**UX:**

- Server-side pagination (DEFAULT_PAGE_SIZE: 20)
- Wyszukiwanie przez URL params
- Loading skeleton podczas ładowania
- Empty state z CTA gdy brak użytkowników

**Dostępność:**

- Nawigacja klawiszowa w tabeli
- `aria-label` dla przycisków akcji

**Bezpieczeństwo:**

- **Tylko Admin** - sprawdzanie roli w proxy.ts i Server Action
- RLS na poziomie bazy danych

---

### 2.14. Admin: Create User Form

| Atrybut | Wartość |
|---------|---------|
| **Ścieżka** | `/admin/users/new` |
| **Grupa routingu** | `(dashboard)` |
| **Cel** | Tworzenie nowego konta użytkownika |

**Kluczowe informacje do wyświetlenia:**

- Formularz: Email, Hasło tymczasowe, Imię, Nazwisko, Rola

**Kluczowe komponenty:**

- `CreateUserForm` (Client) - formularz z react-hook-form
- `EmailInput` - pole email z walidacją
- `PasswordInput` - hasło tymczasowe (z generatorem)
- `FormField` - pola: Imię, Nazwisko
- `RoleSelect` (Client) - dropdown wyboru roli (admin/coordinator)
- `FormActions` - Zapisz/Anuluj

**UX:**

- Walidacja email w czasie rzeczywistym
- Generator hasła tymczasowego (przycisk "Generuj")
- Sukces → przekierowanie na listę z toast

**Dostępność:**

- `aria-required` dla wymaganych pól
- `aria-invalid` + `aria-describedby` dla błędów
- Focus na pierwszym polu przy otwarciu

**Bezpieczeństwo:**

- **Tylko Admin** - sprawdzanie roli
- Hasło tymczasowe - użytkownik powinien je zmienić przy pierwszym logowaniu

---

## 3. Mapa podróży użytkownika

### 3.1. Flow logowania (US-001)

```
[Start] → [Strona Login] → [Wypełnij formularz] → [Submit]
                                                      ↓
                                          [Błąd] ← [Walidacja] → [Sukces]
                                            ↓                        ↓
                                    [Pokaż komunikat]         [Redirect → Board]
```

### 3.2. Flow tworzenia przypisania (US-005, US-006) - główny przypadek

```
[Board] → [Filtruj po dostępności] → [Szukaj pracownika]
              (DateTimePicker)            (SearchInput)
                                              ↓
                                    [Znajdź pracownika]
                                              ↓
                                    [Kliknij "Przypisz"]
                                              ↓
                                    [Modal: CreateAssignment]
                                              ↓
              [Wybierz Miejsce pracy] → [Wybierz Stanowisko] → [Ustaw datę/czas]
                                                                      ↓
                                                              [Zapisz]
                                                                  ↓
                            [Sukces: Toast + Odśwież widok] ← [Server Action]
```

### 3.3. Flow kończenia przypisania (US-007, US-008)

```
[Board] → [Rozwiń wiersz pracownika] → [Lista przypisań]
                                              ↓
                              [Aktywne przypisanie bez end_at]
                                              ↓
                                    [Kliknij "Zakończ"]
                                              ↓
                                    [Modal: EndAssignment]
                                              ↓
                                    [Wprowadź datę/czas zakończenia]
                                              ↓
                                    [Zapisz]
                                              ↓
                            [Sukces: Toast + Status → completed]
```

### 3.4. Flow anulowania przypisania (US-009)

```
[Board] → [Rozwiń wiersz pracownika] → [Lista przypisań]
                                              ↓
                            [Zaplanowane przypisanie (przed start_at)]
                                              ↓
                                    [Kliknij "Anuluj"]
                                              ↓
                                    [Dialog potwierdzenia]
                                              ↓
                        [Anuluj] ← [Wybór] → [Potwierdź]
                           ↓                      ↓
                      [Zamknij]           [Server Action]
                                              ↓
                                    [Sukces: Usuń z listy]
```

### 3.5. Flow generowania raportu (US-010)

```
[Nawigacja] → [Reports] → [Ustaw filtry]
                                ↓
               [DateRange] + [Klient (opcjonalnie)]
                                ↓
                        [Kliknij "Generuj"]
                                ↓
                        [Loading skeleton]
                                ↓
      [Brak danych: Empty State] ← [Wyniki] → [Tabela z danymi]
                                                      ↓
                                        [Kliknij "Eksportuj CSV"]
                                                      ↓
                                            [Pobierz plik]
```

### 3.6. Flow zarządzania danymi (Admin) - US-002, US-003

```
[Board] → [Nawigacja: Klienci] → [Lista klientów]
                                        ↓
        [Dodaj nowego] ← [Wybór] → [Edytuj istniejącego]
              ↓                            ↓
    [Formularz nowego]           [Formularz edycji]
              ↓                            ↓
        [Zapisz]                   [Zapisz / Usuń]
              ↓                            ↓
    [Sukces: Redirect]           [Sukces: Redirect]
```

### 3.7. Flow resetowania hasła (US-011)

```
[Login] → [Kliknij "Zapomniałem hasła"] → [/forgot-password]
                                                ↓
                                        [Wpisz email]
                                                ↓
                                        [Submit]
                                                ↓
                                    [Komunikat: sprawdź email]
                                                ↓
                            [Użytkownik otwiera email]
                                                ↓
                            [Kliknij link] → [/reset-password?token=...]
                                                ↓
                                        [Wpisz nowe hasło x2]
                                                ↓
                                        [Submit]
                                                ↓
                                [Sukces: Redirect → Login + Toast]
```

### 3.8. Flow zarządzania użytkownikami (Admin) - US-012

```
[Dashboard] → [Sidebar: Użytkownicy] → [/admin/users]
                                            ↓
                                    [Lista użytkowników]
                                            ↓
                        [Dodaj użytkownika] → [/admin/users/new]
                                                    ↓
                                            [Formularz: email, hasło, imię, nazwisko, rola]
                                                    ↓
                                            [Submit]
                                                    ↓
                                    [Sukces: Redirect → /admin/users + Toast]
```

---

## 4. Układ i struktura nawigacji

### 4.1. Główny layout dashboard

```
┌─────────────────────────────────────────────────────────┐
│ Header                                          [User] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │              Main Content Area               │
│ (nav)    │                                              │
│          │                                              │
│ [≡]Board │                                              │
│ [≡]Workers                                              │
│ [≡]Reports                                              │
│ ──────── │                                              │
│ Admin:   │                                              │
│ [≡]Klienci                                              │
│ [≡]Lokalizacje                                          │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 4.2. Struktura nawigacji

**Sidebar (wszystkie role):**

| Pozycja | Ikona | Ścieżka | Opis |
|---------|-------|---------|------|
| Board | `Home` | `/` | Główny widok operacyjny |
| Pracownicy | `Users` | `/workers` | Zarządzanie pracownikami |
| Raporty | `BarChart3` | `/reports` | Raporty godzin |

**Sidebar (tylko Admin):**

| Pozycja | Ikona | Ścieżka | Opis |
|---------|-------|---------|------|
| Klienci | `Building2` | `/clients` | Zarządzanie klientami |
| Lokalizacje | `MapPin` | `/locations` | Zarządzanie miejscami pracy |
| Użytkownicy | `Users` | `/admin/users` | Zarządzanie kontami użytkowników |

### 4.3. Responsywność

**Desktop (≥1024px):**

- Sidebar stale widoczny (collapsible)
- Pełna tabela ze scrollem poziomym gdy potrzebny

**Tablet (768px - 1023px):**

- Sidebar collapsed domyślnie
- Toggle button w header

**Mobile (<768px):**

- Sidebar jako Sheet (slide-in menu)
- Hamburger menu w header
- Tabele ze scrollem poziomym

### 4.4. User menu (Header)

```
┌────────────────────────────┐
│ Jan Kowalski            ▼  │
├────────────────────────────┤
│ Profil                     │
│ ─────────────────────────  │
│ Wyloguj                    │
└────────────────────────────┘
```

---

## 5. Kluczowe komponenty

### 5.1. Komponenty UI (shadcn/ui)

| Komponent | Użycie |
|-----------|--------|
| `Button` | Akcje, submit formularzy |
| `Input` | Pola tekstowe formularzy |
| `Select` | Dropdowny (klient, status) |
| `Dialog` | Modale (CreateAssignment, EndAssignment) |
| `AlertDialog` | Potwierdzenia destrukcyjnych akcji |
| `Table` | Bazowy komponent tabel |
| `Calendar` | DatePicker |
| `Sheet` | Mobile sidebar |
| `Toast` | Notyfikacje |
| `Skeleton` | Loading states |
| `Badge` | Statusy przypisań |
| `Card` | Kontenery sekcji |

### 5.2. Komponenty layoutu

| Komponent | Opis |
|-----------|------|
| `DashboardLayout` | Wrapper z sidebar + header |
| `Sidebar` | Nawigacja główna (Client - collapsible) |
| `Header` | Top bar z user menu |
| `PageHeader` | Tytuł strony + akcje |
| `PageContainer` | Wrapper z padding/max-width |

### 5.3. Komponenty formularzy

| Komponent | Opis | Status |
|-----------|------|--------|
| `FormField` | Wrapper dla pola z label + error | Planned |
| `FormActions` | Sekcja przycisków (Zapisz/Anuluj) | Planned |
| `SearchInput` | Input z debounce + ikona search, URL sync | ✅ Done |
| `DateTimePicker` | Calendar + time select (hour/minute) z Apply/Clear | ✅ Done |
| `DateRangePicker` | Wybór zakresu dat | Planned |
| `PhoneInput` | Input z formatowaniem telefonu (PL: 123 456 789) | ✅ Done |
| `ComboboxSelect` | Generyczny dropdown z wyszukiwaniem (shadcn Command) | ✅ Done |
| `ClientSelect` | Dropdown wyboru klienta | Planned |
| `LocationSelect` | Dropdown wyboru lokalizacji | Planned |
| `PositionSelect` | Dropdown wyboru stanowiska | Planned |

**Implementacja TECH-003:**

- `useSearchInput` hook - debouncing (lodash-es) + opcjonalna synchronizacja z URL
- Wszystkie komponenty wspierają: `error`, `disabled`, `className`, ARIA attributes
- Integracja z react-hook-form przez `Controller` pattern

### 5.4. Komponenty tabel

| Komponent | Opis |
|-----------|------|
| `DataTable` | Wrapper @tanstack/react-table |
| `DataTableHeader` | Nagłówek z sortowaniem |
| `DataTablePagination` | Kontrolki paginacji |
| `ExpandableRow` | Wiersz z rozwijalną zawartością |
| `EmptyState` | Komunikat gdy brak danych |
| `TableSkeleton` | Loading skeleton dla tabeli |

### 5.5. Komponenty domenowe

| Komponent | Moduł | Opis |
|-----------|-------|------|
| `WorkersBoardTable` | Board | Główna tabela z przypisaniami |
| `AssignmentRow` | Board | Wiersz przypisania w rozwinięciu |
| `AssignmentStatusBadge` | Board | Badge ze statusem |
| `CreateAssignmentModal` | Assignments | Modal tworzenia |
| `EndAssignmentModal` | Assignments | Modal kończenia |
| `CancelAssignmentDialog` | Assignments | Dialog anulowania |
| `WorkerForm` | Workers | Formularz pracownika |
| `ClientForm` | Clients | Formularz klienta |
| `LocationForm` | Locations | Formularz lokalizacji |
| `PositionsManager` | Locations | Zarządzanie stanowiskami |
| `ReportFilters` | Reports | Filtry raportu |
| `ReportTable` | Reports | Tabela wyników raportu |
| `ExportButton` | Reports | Przycisk eksportu CSV |
| `ForgotPasswordForm` | Auth | Formularz przypomnienia hasła |
| `ResetPasswordForm` | Auth | Formularz ustawiania nowego hasła |
| `ProfileForm` | Profile | Formularz edycji profilu |
| `UsersTable` | Admin | Tabela użytkowników systemu |
| `CreateUserForm` | Admin | Formularz tworzenia użytkownika |
| `RoleSelect` | Admin | Dropdown wyboru roli |
| `UserStatusBadge` | Admin | Badge ze statusem użytkownika |
| `DeactivateUserDialog` | Admin | Dialog dezaktywacji użytkownika |

### 5.6. Komponenty współdzielone

| Komponent | Opis |
|-----------|------|
| `ConfirmDialog` | Uniwersalny dialog potwierdzenia |
| `LoadingButton` | Button z loading spinner |
| `ErrorMessage` | Wyświetlanie błędów akcji |
| `Breadcrumbs` | Nawigacja breadcrumb |
| `RoleGuard` | Warunkowe renderowanie dla roli |

---

## 6. Mapowanie User Stories → Komponenty UI

| User Story | Widok | Główne komponenty |
|------------|-------|-------------------|
| **US-001** Logowanie | `/login` | `LoginForm`, `PasswordInput`, `SubmitButton` |
| **US-002** Zarządzanie klientami | `/clients/*` | `ClientsTable`, `ClientForm`, `DeleteClientDialog` |
| **US-003** Zarządzanie lokalizacjami | `/locations/*` | `LocationsTable`, `LocationForm`, `PositionsManager` |
| **US-004** Zarządzanie pracownikami | `/workers/*` | `WorkersTable`, `WorkerForm` |
| **US-005** Lista pracowników + filtry | `/` (Board) | `WorkersBoardTable`, `SearchInput`, `AvailabilityFilter` |
| **US-006** Tworzenie przypisania | `/` (Board) | `CreateAssignmentModal`, `LocationSelect`, `PositionSelect`, `DateTimePicker` |
| **US-007** Szczegóły przypisań | `/` (Board) | `ExpandableRow`, `AssignmentRow`, `AssignmentStatusBadge` |
| **US-008** Kończenie przypisania | `/` (Board) | `EndAssignmentModal`, `DateTimePicker` |
| **US-009** Anulowanie przypisania | `/` (Board) | `CancelAssignmentDialog` |
| **US-010** Raporty godzin | `/reports` | `ReportFilters`, `DateRangePicker`, `ReportTable`, `ExportButton` |
| **US-011** Resetowanie hasła | `/forgot-password`, `/reset-password` | `ForgotPasswordForm`, `ResetPasswordForm`, `PasswordInput`, `SubmitButton` |
| **US-012** Zarządzanie użytkownikami (Admin) | `/admin/users/*` | `UsersTable`, `CreateUserForm`, `RoleSelect`, `DeactivateUserDialog` |
| **US-013** Edycja profilu | `/profile` | `ProfileForm`, `FormField`, `FormActions` |

---

## 7. Stany i przypadki brzegowe

### 7.1. Loading states

| Kontekst | Rozwiązanie |
|----------|-------------|
| Ładowanie strony | `loading.tsx` z Skeleton |
| Ładowanie tabeli | `TableSkeleton` |
| Submit formularza | `LoadingButton` + disabled state |
| Akcja na przypisaniu | Optimistic update + Toast |

### 7.2. Empty states

| Kontekst | Komunikat | CTA |
|----------|-----------|-----|
| Brak pracowników | "Nie dodano jeszcze pracowników" | "Dodaj pierwszego pracownika" |
| Brak wyników wyszukiwania | "Nie znaleziono pracowników" | "Wyczyść filtry" |
| Brak przypisań pracownika | "Brak aktywnych przypisań" | "Utwórz przypisanie" |
| Pusty raport | "Brak danych dla wybranego okresu" | "Zmień zakres dat" |
| Brak klientów (Admin) | "Nie dodano jeszcze klientów" | "Dodaj pierwszego klienta" |

### 7.3. Error states

| Błąd | Obsługa |
|------|---------|
| Błąd sieci | Error boundary + "Spróbuj ponownie" |
| Walidacja formularza | Inline errors pod polami |
| NOT_FOUND | Redirect na listę + Toast |
| HAS_DEPENDENCIES | Dialog z informacją o zależnościach |
| FORBIDDEN | Redirect na Board + Toast "Brak uprawnień" |
| SESSION_EXPIRED | Redirect na Login |

### 7.4. Edge cases

| Przypadek | Obsługa |
|-----------|---------|
| Próba anulowania po start_at | Przycisk disabled + tooltip |
| Usunięcie klienta z lokalizacjami | Blokada + komunikat |
| Duplikat numeru telefonu | Błąd walidacji z komunikatem |
| Konflikt czasowy przypisania | Info (nie blokuje - per PRD) |
| Bardzo długa lista | Server-side pagination |

---

## 8. Integracja z warstwą danych

### 8.1. Server Actions używane przez widoki

| Widok | Server Actions |
|-------|----------------|
| Login | `signIn` |
| Forgot Password | `resetPassword` |
| Reset Password | `updatePassword` |
| Board | `getWorkers`, `createAssignment`, `endAssignment`, `cancelAssignment` |
| Workers | `getWorkers`, `getWorker`, `createWorker`, `updateWorker`, `deleteWorker` |
| Clients | `getClients`, `getClient`, `createClient`, `updateClient`, `deleteClient` |
| Locations | `getWorkLocations`, `getWorkLocation`, `createWorkLocation`, `updateWorkLocation`, `deleteWorkLocation` |
| Reports | `generateHoursReport`, `exportReportToCsv` |
| Profile | `getCurrentUser`, `updateProfile` |
| Admin: Users | `getUsers`, `signUp`, `deactivateUser` |

### 8.2. Hooki integracyjne

| Hook | Opis | Status |
|------|------|--------|
| `useServerAction` | Wrapper dla Server Actions z callbacks | ✅ Done |
| `useSearchInput` | Debouncing (lodash-es) + URL sync dla wyszukiwania | ✅ Done |
| `useUserRole` | Pobieranie roli użytkownika | Planned |
| `useSearchParams` | URL state dla filtrów (Next.js built-in) | Built-in |

### 8.3. Pattern użycia useServerAction

```typescript
// Przykład użycia w komponencie
const { execute, isPending, isError, error } = useServerAction(createAssignment, {
  onSuccess: (data) => {
    toast.success('Przypisanie utworzone');
    closeModal();
  },
  onError: (error) => {
    toast.error(getErrorMessage(error.code));
  },
});
```

---

## 9. Podsumowanie priorytetów implementacji

### Faza 1: Core (MVP)

1. Login + ochrona tras
2. Board z podstawową listą
3. Tworzenie przypisań
4. Kończenie/anulowanie przypisań
5. Admin: Zarządzanie użytkownikami (`/admin/users`)

### Faza 2: CRUD

1. Workers CRUD
2. Clients CRUD (Admin)
3. Locations CRUD (Admin)

### Faza 3: Auth & Profile

1. Forgot Password (`/forgot-password`)
2. Reset Password (`/reset-password`)
3. Profile (`/profile`)

### Faza 4: Raportowanie

1. Reports z filtrowaniem
2. Eksport CSV

### Faza 5: Polish

1. Optimistic updates
2. Advanced filtering
3. Mobile optimizations
