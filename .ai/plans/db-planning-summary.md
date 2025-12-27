# Podsumowanie planowania bazy danych - One Staff Dashboard MVP

<conversation_summary>

<decisions>

1. Wykorzystanie wbudowanej tabeli `auth.users` z Supabase Auth z dodatkową tabelą `profiles` zawierającą `id` (FK), `role` (enum: 'admin', 'coordinator'), `first_name`, `last_name`.

2. Implementacja soft delete z kolumną `deleted_at` (TIMESTAMP NULL) dla tabel: `clients`, `work_locations`, `temporary_workers`, `positions`.

3. Tabela `work_locations` z kolumnami: `id` (UUID PK), `client_id` (FK NOT NULL), `name`, `address`, `email`, `phone`, `created_at`, `updated_at`, `deleted_at`.

4. Osobna tabela `positions` z relacją wiele-do-jednego z `work_locations`. Indeks na `(work_location_id, is_active)`.

5. Tabela `temporary_workers` z kolumnami: `id` (UUID), `first_name`, `last_name`, `phone` (NOT NULL UNIQUE), `created_at`, `updated_at`, `deleted_at`. Indeks GIN z `pg_trgm` dla wyszukiwania.

6. Tabela `assignments` z kolumnami: `id`, `worker_id`, `position_id`, `start_at`, `end_at`, `status` (enum), `created_by`, `ended_by`, `cancelled_by`, `created_at`, `updated_at`. BEZ constraintu na nakładanie się czasów.

7. Tabela `assignment_audit_log` append-only. UPDATE/DELETE tylko dla Administratorów.

8. Indeksy kompozytowe: `(worker_id, start_at, end_at)`, `(position_id, start_at)`. Częściowy indeks `WHERE status = 'completed'`.

9. RLS: Administratorzy - pełny dostęp do `clients`, `work_locations`, `profiles`. Koordynatorzy - odczyt `clients`/`work_locations`, pełny CRUD na `temporary_workers`, `assignments`, `positions`.

10. Brak widoków zmaterializowanych dla MVP.

11. Constraint UNIQUE na `phone` + normalizacja formatu przez trigger.

12. CHECK constraint: `end_at IS NULL OR end_at > start_at`.

13. Typ danych czasowych: `TIMESTAMPTZ`, nazwy kolumn: `start_at`, `end_at`.

14. Rozszerzenie `pgcrypto` z wartością domyślną `gen_random_uuid()` dla UUID.

15. Indeks GIN z rozszerzeniem `pg_trgm` na `(first_name || ' ' || last_name || ' ' || phone)` dla wyszukiwania tekstowego.

16. Funkcja `is_worker_available(worker_id UUID, check_datetime TIMESTAMPTZ)` z NOT EXISTS dla sprawdzania dostępności.

17. Dodanie pól kontaktowych `email`, `phone`, `address` do tabeli `clients`.

18. ON DELETE RESTRICT dla większości relacji FK, ON DELETE CASCADE dla `assignment_audit_log.assignment_id`.

19. Funkcja `normalize_phone(phone TEXT)` + trigger BEFORE INSERT/UPDATE dla normalizacji telefonu.

20. Kolumny `ended_by` i `cancelled_by` (FK NULL do profiles.id) w tabeli `assignments`.

21. Migracje przez Supabase CLI z katalogiem `supabase/migrations/`.

22. Funkcje RPC: `get_worker_availability()`, `get_hours_report()`, `end_assignment()`.

</decisions>

<matched_recommendations>

1. **Supabase Auth + profiles pattern** - Standardowa architektura Supabase z rozszerzeniem `profiles` dla danych aplikacyjnych użytkowników, zgodna z best practices.

2. **Soft delete z `deleted_at`** - Zachowanie integralności danych historycznych, możliwość audytu i odzyskania rekordów bez utraty powiązań.

3. **pg_trgm + GIN dla wyszukiwania** - Optymalne rozwiązanie dla fuzzy search po imieniu, nazwisku i telefonie pracowników tymczasowych.

4. **TIMESTAMPTZ dla dat** - Bezpieczne przechowywanie czasów z uwzględnieniem stref czasowych, eliminacja problemów z konwersją.

5. **Append-only audit log** - Niemodyfikowalny dziennik zdarzeń zgodny z wymaganiami PRD dotyczącymi audytu operacji na przypisaniach.

6. **Indeksy kompozytowe dla raportów** - Optymalizacja zapytań generujących raporty przepracowanych godzin w zadanych zakresach dat.

7. **RPC dla złożonych operacji** - Enkapsulacja logiki biznesowej w funkcjach bazodanowych, redukcja round-trips między aplikacją a bazą.

8. **ON DELETE RESTRICT** - Ochrona integralności referencyjnej, zapobieganie przypadkowemu usunięciu powiązanych danych.

9. **Normalizacja telefonu przez trigger** - Automatyczna standaryzacja formatu numeru telefonu przed zapisem, eliminacja duplikatów.

10. **Częściowe indeksy** - Optymalizacja zapytań dla konkretnych podzbiorów danych (np. `WHERE deleted_at IS NULL`, `WHERE status = 'completed'`).

</matched_recommendations>

<database_planning_summary>

### Główne wymagania dotyczące schematu bazy danych

System wymaga schematu PostgreSQL obsługującego:
- Dwupoziomową hierarchię użytkowników (Administrator/Koordynator) zintegrowaną z Supabase Auth
- Zarządzanie encjami biznesowymi: Klienci → Miejsca Pracy → Stanowiska → Przypisania
- Pełną historię zmian w przypisaniach poprzez immutable audit log
- Efektywne wyszukiwanie i filtrowanie pracowników tymczasowych
- Generowanie raportów przepracowanych godzin z możliwością eksportu CSV/Excel

### Kluczowe encje i ich relacje

```
auth.users (Supabase Auth)
    ↓ 1:1
profiles (id, role, first_name, last_name)
    ↓ 1:N (created_by, ended_by, cancelled_by)
assignments
    ↑ N:1
temporary_workers (id, first_name, last_name, phone)

clients (id, name, email, phone, address, deleted_at)
    ↓ 1:N
work_locations (id, client_id, name, address, email, phone, deleted_at)
    ↓ 1:N
positions (id, work_location_id, name, is_active, deleted_at)
    ↓ 1:N
assignments (id, worker_id, position_id, start_at, end_at, status, created_by, ended_by, cancelled_by)
    ↓ 1:N
assignment_audit_log (id, assignment_id, action, old_values, new_values, performed_by, created_at)
```

### Ważne kwestie dotyczące bezpieczeństwa

- **Row Level Security (RLS)**: Polityki bezpieczeństwa na poziomie wierszy z rozróżnieniem uprawnień dla ról Admin i Coordinator
- **Audit log**: Append-only tabela z ograniczeniem UPDATE/DELETE tylko dla Administratorów
- **Integralność danych**: FK constraints z ON DELETE RESTRICT chroniące przed usunięciem powiązanych rekordów
- **Unikalność telefonu**: Constraint UNIQUE z automatyczną normalizacją eliminujący duplikaty pracowników

### Ważne kwestie dotyczące skalowalności

- **Indeksy kompozytowe**: `(worker_id, start_at, end_at)` i `(position_id, start_at)` dla zapytań raportowych
- **Indeks GIN z pg_trgm**: Wydajne wyszukiwanie tekstowe po imieniu, nazwisku i telefonie
- **Częściowe indeksy**: Optymalizacja dla aktywnych rekordów (`WHERE deleted_at IS NULL`)
- **Soft delete**: Zachowanie danych historycznych bez wpływu na wydajność zapytań operacyjnych
- **Funkcje RPC**: Redukcja liczby zapytań dla złożonych operacji biznesowych

### Specyfika MVP

- Brak materialized views (wystarczająca wydajność na poziomie indeksów dla skali MVP)
- Brak tabeli konfiguracyjnej systemu
- Brak przypisania Koordynatorów do konkretnych Klientów (wszyscy mają dostęp do wszystkich)
- Brak notatek w przypisaniach (można łatwo dodać później)
- Świadome dozwolenie nakładających się przypisań (odpowiedzialność Koordynatora zgodnie z PRD)

</database_planning_summary>

<unresolved_issues>

1. **Wartości enum dla statusu przypisania** - Dokładna lista wartości (`scheduled`, `active`, `completed`, `cancelled`?) wymaga finalnego potwierdzenia przed implementacją migracji.

2. **Migracja danych początkowych** - PRD wyklucza narzędzia migracji, ale należy ustalić proces ręcznego wprowadzenia danych klientów i miejsc pracy przy wdrożeniu produkcyjnym.

3. **Retencja audit log** - Brak ustalonej polityki archiwizacji lub czyszczenia logów audytowych w dłuższej perspektywie czasowej.

4. **Format eksportu raportów** - Szczegółowa struktura pliku CSV/Excel (kolejność kolumn, formatowanie dat, nagłówki) nie została zdefiniowana na poziomie bazy danych.

5. **Walidacja anulowania przypisania** - Logika sprawdzania czy `current_timestamp < start_at` wymaga decyzji o miejscu implementacji (trigger bazodanowy vs. warstwa aplikacji).

</unresolved_issues>

</conversation_summary>
