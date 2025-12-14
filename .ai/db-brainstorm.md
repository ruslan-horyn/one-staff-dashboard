# Database Schema Planning - One Staff Dashboard MVP

## Sesja planowania schematu bazy danych PostgreSQL

---

<questions>

### Runda 1

1. Jak powinny być przechowywane dane użytkowników systemu (Administrator, Koordynator) w kontekście Supabase Auth?
2. Czy tabela Klientów (`clients`) powinna obsługiwać soft delete, czy hard delete przy usuwaniu rekordów?
3. Jaką strukturę powinna mieć tabela Miejsc Pracy (`work_locations`) i jakie pola są wymagane?
4. Jak modelować relację między Otwartymi Stanowiskami (`positions`) a Miejscami Pracy (`work_locations`)?
5. Jak zaprojektować tabelę Pracowników Tymczasowych (`temporary_workers`) z uwzględnieniem przyszłej rozbudowy?
6. Jak zaprojektować tabelę Przypisań (`assignments`) z uwzględnieniem nakładających się czasowo zleceń?
7. Jak zaimplementować dziennik zdarzeń (audit log) dla operacji na przypisaniach?
8. Jakie strategie indeksowania zastosować dla optymalizacji raportów przepracowanych godzin?
9. Jak skonfigurować Row Level Security (RLS) dla różnych ról użytkowników?
10. Czy potrzebne są widoki zmaterializowane (materialized views) dla dashboardu głównego?

### Runda 2

1. Czy numery telefonów pracowników tymczasowych powinny być unikalne w systemie?
2. Jak obsłużyć walidację daty zakończenia przypisania względem daty rozpoczęcia?
3. Czy tabela `positions` (Otwarte Stanowiska) powinna być typu soft delete czy hard delete?
4. Jak przechowywać historię zmian statusu przypisania (scheduled → active → completed)?
5. Czy potrzebna jest tabela łącząca Koordynatorów z Klientami/Miejscami Pracy (przypisanie odpowiedzialności)?
6. Jaki typ danych użyć dla kolumn czasowych (start_datetime, end_datetime)?
7. Jak obsłużyć generowanie UUID dla kluczy głównych?
8. Czy potrzebne są dodatkowe indeksy dla funkcji wyszukiwania tekstowego pracowników?
9. Jak zaimplementować filtr "Dostępny od" (pracownicy bez przypisań w danym momencie)?
10. Czy kolumna `created_by` w tabeli `assignments` powinna być wymagana (NOT NULL)?

### Runda 3

1. Jak zaimplementować normalizację numeru telefonu przed zapisem?
2. Czy tabela `clients` powinna zawierać dodatkowe pola kontaktowe (email, telefon, adres)?
3. Jak obsłużyć kaskadowe usuwanie/aktualizacje w relacjach FK?
4. Czy potrzebna jest tabela konfiguracyjna dla ustawień systemu?
5. Jak przechowywać informację o tym, kto zakończył lub anulował przypisanie?
6. Czy dodać kolumnę `notes` (notatki) do tabeli przypisań?
7. Jak obsłużyć migracje schematu bazy danych w Supabase?
8. Czy tabela `profiles` powinna przechowywać informacje o ostatnim logowaniu?
9. Jak zaimplementować trigger dla automatycznego tworzenia wpisów w audit log?
10. Czy potrzebne są funkcje RPC (Remote Procedure Call) dla złożonych operacji?

</questions>

---

<answers>

### Runda 1

1. **Zgodnie z rekomendacją** - Wykorzystać wbudowaną tabelę `auth.users` z Supabase Auth. Utworzyć dodatkową tabelę `profiles` z kolumnami `id` (FK do auth.users), `role` (enum: 'admin', 'coordinator'), `first_name`, `last_name`.

2. **Zgodnie z rekomendacją** - Soft delete z kolumną `deleted_at` (TIMESTAMP NULL). Constraint blokujący soft delete gdy istnieją aktywne Miejsca Pracy.

3. **Zgodnie z rekomendacją** - Tabela z kolumnami: `id` (UUID PRIMARY KEY), `client_id` (FK NOT NULL), `name` (VARCHAR NOT NULL), `address` (TEXT), `email` (VARCHAR), `phone` (VARCHAR), `created_at`, `updated_at`, `deleted_at`.

4. **Zgodnie z rekomendacją** - Osobna tabela `positions` z relacją wiele-do-jednego z `work_locations`. Indeks na `(work_location_id, is_active)`.

5. **Zgodnie z rekomendacją** - Struktura: `id` (UUID), `first_name`, `last_name`, `phone` (NOT NULL), `created_at`, `updated_at`, `deleted_at`. Indeks GIN z `pg_trgm` dla wyszukiwania.

6. **Zgodnie z rekomendacją** - Struktura: `id`, `worker_id`, `position_id`, `start_at`, `end_at`, `status` (enum), `created_by`, `created_at`, `updated_at`. BEZ constraintu na nakładanie się czasów.

7. **Zgodnie z rekomendacją + modyfikacja** - Tabela `assignment_audit_log` append-only. **UPDATE/DELETE tylko dla Administratorów** (nie dla wszystkich użytkowników).

8. **Zgodnie z rekomendacją** - Indeksy kompozytowe: `(worker_id, start_at, end_at)`, `(position_id, start_at)`. Częściowy indeks `WHERE status = 'completed'`.

9. **Zgodnie z rekomendacją** - Administratorzy: pełny dostęp do `clients`, `work_locations`, `profiles`. Koordynatorzy: odczyt `clients`, `work_locations`; pełny CRUD na `temporary_workers`, `assignments`, `positions`.

10. **NIE** - Nie tworzymy widoków zmaterializowanych dla MVP.

### Runda 2

1. **TAK + normalizacja** - Constraint UNIQUE na kolumnę `phone`. Dodatkowo normalizacja formatu telefonu (usunięcie spacji, myślników) poprzez trigger przed zapisem.

2. **Zgodnie z rekomendacją** - CHECK constraint: `end_at IS NULL OR end_at > start_at`. Walidacja anulowania na poziomie aplikacji/triggera.

3. **Zgodnie z rekomendacją** - Soft delete z kolumną `deleted_at`. Częściowy indeks `WHERE deleted_at IS NULL`.

4. **Zgodnie z rekomendacją** - Status w kolumnie `status` w tabeli `assignments`. Zmiany logowane do `assignment_audit_log` przez trigger.

5. **Zgodnie z rekomendacją** - NIE dla MVP. Wszyscy Koordynatorzy mają dostęp do wszystkich danych.

6. **Modyfikacja** - Nazwy kolumn: `start_at`, `end_at`. Typ: `TIMESTAMPTZ` (timestamp with time zone).

7. **pgcrypto** - Użyć rozszerzenia `pgcrypto` z wartością domyślną `gen_random_uuid()`.

8. **TAK** - Indeks GIN z rozszerzeniem `pg_trgm` na `(first_name || ' ' || last_name || ' ' || phone)`.

9. **Zgodnie z rekomendacją** - NOT EXISTS z podzapytaniem. Funkcja SQL `is_worker_available(worker_id UUID, check_datetime TIMESTAMPTZ)`.

10. **Zgodnie z rekomendacją** - `created_by` NOT NULL z FK do `profiles.id`.

### Runda 3

1. **Zgodnie z rekomendacją** - Funkcja `normalize_phone(phone TEXT)` usuwająca znaki poza cyframi. Trigger BEFORE INSERT/UPDATE.

2. **TAK** - Dodać pola kontaktowe do tabeli `clients`: `email` (VARCHAR), `phone` (VARCHAR), `address` (TEXT).

3. **Zgodnie z rekomendacją** - ON DELETE RESTRICT dla większości relacji. ON DELETE CASCADE dla `assignment_audit_log.assignment_id`.

4. **Zgodnie z rekomendacją** - NIE dla MVP. Brak wymagań w PRD.

5. **TAK** - Dodać kolumny `ended_by` i `cancelled_by` (FK NULL do profiles.id) w tabeli `assignments`.

6. **Zgodnie z rekomendacją** - NIE dla MVP. Można łatwo dodać później.

7. **Zgodnie z rekomendacją** - Supabase CLI z katalogiem `supabase/migrations/`. Każda zmiana jako osobny plik SQL z timestampem.

8. **NIE** - Nie przechowywać informacji o ostatnim logowaniu w `profiles`. Supabase Auth automatycznie śledzi w `auth.users`.

9. **Zgodnie z rekomendacją** - Funkcja triggerowa reagująca na INSERT/UPDATE w tabeli `assignments`, automatycznie tworząca wpisy w audit log.

10. **Zgodnie z rekomendacją** - Funkcje RPC:
    - `get_worker_availability(worker_id, date_from, date_to)`
    - `get_hours_report(date_from, date_to, client_id)`
    - `end_assignment(assignment_id, end_at)`

</answers>

---

## Podsumowanie decyzji

| Aspekt | Decyzja |
|--------|---------|
| Auth | Supabase Auth + tabela `profiles` |
| Soft delete | Tak, dla `clients`, `work_locations`, `temporary_workers`, `positions` |
| UUID | pgcrypto z `gen_random_uuid()` |
| Timestamps | `TIMESTAMPTZ`, nazwy: `start_at`, `end_at` |
| Audit log | Append-only, UPDATE/DELETE tylko Admin |
| Phone | UNIQUE + normalizacja przez trigger |
| Overlapping | Dozwolone (brak constraintów) |
| Materialized views | NIE dla MVP |
| RPC | TAK - 3 funkcje |
| Wyszukiwanie | pg_trgm + indeks GIN |
