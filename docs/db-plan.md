# Schemat bazy danych - One Staff Dashboard MVP

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### 1.1. Tabela `profiles`

Rozszerzenie wbudowanej tabeli `auth.users` z Supabase Auth.

| Kolumna      | Typ danych                          | Ograniczenia                                           |
|--------------|-------------------------------------|--------------------------------------------------------|
| id           | UUID                                | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE |
| role         | user_role (ENUM)                    | NOT NULL, DEFAULT 'coordinator'                        |
| first_name   | VARCHAR(100)                        | NOT NULL                                               |
| last_name    | VARCHAR(100)                        | NOT NULL                                               |
| created_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |

**Typ ENUM `user_role`:**
```sql
CREATE TYPE user_role AS ENUM ('admin', 'coordinator');
```

---

### 1.2. Tabela `clients`

Przechowuje dane klientów agencji.

| Kolumna      | Typ danych                          | Ograniczenia                                           |
|--------------|-------------------------------------|--------------------------------------------------------|
| id           | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| name         | VARCHAR(255)                        | NOT NULL                                               |
| email        | VARCHAR(255)                        | NOT NULL                                               |
| phone        | VARCHAR(20)                         | NOT NULL                                               |
| address      | TEXT                                | NOT NULL                                               |
| created_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at   | TIMESTAMPTZ                         | NULL (soft delete)                                     |

---

### 1.3. Tabela `work_locations`

Miejsca pracy powiązane z klientami.

| Kolumna      | Typ danych                          | Ograniczenia                                           |
|--------------|-------------------------------------|--------------------------------------------------------|
| id           | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| client_id    | UUID                                | NOT NULL, REFERENCES clients(id) ON DELETE RESTRICT    |
| name         | VARCHAR(255)                        | NOT NULL                                               |
| address      | TEXT                                | NOT NULL                                               |
| email        | VARCHAR(255)                        | NULL                                                   |
| phone        | VARCHAR(20)                         | NULL                                                   |
| created_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at   | TIMESTAMPTZ                         | NULL (soft delete)                                     |

---

### 1.4. Tabela `positions`

Stanowiska dostępne w miejscach pracy.

| Kolumna          | Typ danych                          | Ograniczenia                                           |
|------------------|-------------------------------------|--------------------------------------------------------|
| id               | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| work_location_id | UUID                                | NOT NULL, REFERENCES work_locations(id) ON DELETE RESTRICT |
| name             | VARCHAR(255)                        | NOT NULL                                               |
| is_active        | BOOLEAN                             | NOT NULL, DEFAULT TRUE                                 |
| created_at       | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at       | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at       | TIMESTAMPTZ                         | NULL (soft delete)                                     |

---

### 1.5. Tabela `temporary_workers`

Pracownicy tymczasowi.

| Kolumna      | Typ danych                          | Ograniczenia                                           |
|--------------|-------------------------------------|--------------------------------------------------------|
| id           | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| first_name   | VARCHAR(100)                        | NOT NULL                                               |
| last_name    | VARCHAR(100)                        | NOT NULL                                               |
| phone        | VARCHAR(20)                         | NOT NULL, UNIQUE                                       |
| created_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at   | TIMESTAMPTZ                         | NULL (soft delete)                                     |

---

### 1.6. Tabela `assignments`

Przypisania pracowników do stanowisk.

| Kolumna       | Typ danych                          | Ograniczenia                                           |
|---------------|-------------------------------------|--------------------------------------------------------|
| id            | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| worker_id     | UUID                                | NOT NULL, REFERENCES temporary_workers(id) ON DELETE RESTRICT |
| position_id   | UUID                                | NOT NULL, REFERENCES positions(id) ON DELETE RESTRICT  |
| start_at      | TIMESTAMPTZ                         | NOT NULL                                               |
| end_at        | TIMESTAMPTZ                         | NULL, CHECK (end_at IS NULL OR end_at > start_at)      |
| status        | assignment_status (ENUM)            | NOT NULL, DEFAULT 'scheduled'                          |
| created_by    | UUID                                | NOT NULL, REFERENCES profiles(id) ON DELETE RESTRICT   |
| ended_by      | UUID                                | NULL, REFERENCES profiles(id) ON DELETE RESTRICT       |
| cancelled_by  | UUID                                | NULL, REFERENCES profiles(id) ON DELETE RESTRICT       |
| created_at    | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at    | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |

**Typ ENUM `assignment_status`:**
```sql
CREATE TYPE assignment_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
```

**CHECK constraint:**
```sql
CHECK (end_at IS NULL OR end_at > start_at)
```

---

### 1.7. Tabela `assignment_audit_log`

Niemodyfikowalny dziennik zdarzeń dla operacji na przypisaniach.

| Kolumna       | Typ danych                          | Ograniczenia                                           |
|---------------|-------------------------------------|--------------------------------------------------------|
| id            | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| assignment_id | UUID                                | NOT NULL, REFERENCES assignments(id) ON DELETE CASCADE |
| action        | VARCHAR(50)                         | NOT NULL                                               |
| old_values    | JSONB                               | NULL                                                   |
| new_values    | JSONB                               | NULL                                                   |
| performed_by  | UUID                                | NOT NULL, REFERENCES profiles(id) ON DELETE RESTRICT   |
| created_at    | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |

**Dozwolone wartości `action`:** `'created'`, `'updated'`, `'ended'`, `'cancelled'`

---

## 2. Relacje między tabelami

### Diagram relacji

```
auth.users (Supabase Auth)
    │
    │ 1:1 (ON DELETE CASCADE)
    ▼
profiles
    │
    │ 1:N (created_by, ended_by, cancelled_by)
    ▼
assignments ◄────────────────────────────┐
    │                                     │
    │ 1:N (ON DELETE CASCADE)             │ N:1 (worker_id, ON DELETE RESTRICT)
    ▼                                     │
assignment_audit_log              temporary_workers

clients
    │
    │ 1:N (ON DELETE RESTRICT)
    ▼
work_locations
    │
    │ 1:N (ON DELETE RESTRICT)
    ▼
positions
    │
    │ 1:N (ON DELETE RESTRICT)
    ▼
assignments
```

### Szczegółowy opis relacji

| Relacja | Typ | Opis |
|---------|-----|------|
| auth.users → profiles | 1:1 | Każdy użytkownik ma dokładnie jeden profil |
| profiles → assignments (created_by) | 1:N | Koordynator tworzący przypisanie |
| profiles → assignments (ended_by) | 1:N | Koordynator kończący przypisanie |
| profiles → assignments (cancelled_by) | 1:N | Koordynator anulujący przypisanie |
| profiles → assignment_audit_log | 1:N | Użytkownik wykonujący operację |
| clients → work_locations | 1:N | Klient może mieć wiele miejsc pracy |
| work_locations → positions | 1:N | Miejsce pracy może mieć wiele stanowisk |
| positions → assignments | 1:N | Stanowisko może mieć wiele przypisań |
| temporary_workers → assignments | 1:N | Pracownik może mieć wiele przypisań |
| assignments → assignment_audit_log | 1:N | Przypisanie ma wiele wpisów w logu audytowym |

---

## 3. Indeksy

### 3.1. Indeksy podstawowe (Primary Keys)

Automatycznie tworzone przez PostgreSQL dla PRIMARY KEY każdej tabeli.

### 3.2. Indeksy dla kluczy obcych

```sql
-- work_locations
CREATE INDEX idx_work_locations_client_id ON work_locations(client_id);

-- positions
CREATE INDEX idx_positions_work_location_id ON positions(work_location_id);

-- assignments
CREATE INDEX idx_assignments_worker_id ON assignments(worker_id);
CREATE INDEX idx_assignments_position_id ON assignments(position_id);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);

-- assignment_audit_log
CREATE INDEX idx_audit_log_assignment_id ON assignment_audit_log(assignment_id);
CREATE INDEX idx_audit_log_performed_by ON assignment_audit_log(performed_by);
```

### 3.3. Indeksy kompozytowe dla zapytań raportowych

```sql
-- Główny indeks dla wyszukiwania przypisań pracownika w zakresie dat
CREATE INDEX idx_assignments_worker_dates
ON assignments(worker_id, start_at, end_at);

-- Indeks dla wyszukiwania przypisań na stanowisku
CREATE INDEX idx_assignments_position_start
ON assignments(position_id, start_at);

-- Indeks dla aktywnych stanowisk w miejscu pracy
CREATE INDEX idx_positions_location_active
ON positions(work_location_id, is_active)
WHERE deleted_at IS NULL;
```

### 3.4. Indeksy częściowe (Partial Indexes)

```sql
-- Indeks dla zakończonych przypisań (optymalizacja raportów)
CREATE INDEX idx_assignments_completed
ON assignments(worker_id, start_at, end_at)
WHERE status = 'completed';

-- Indeksy dla aktywnych rekordów (soft delete)
CREATE INDEX idx_clients_active
ON clients(id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_work_locations_active
ON work_locations(client_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_positions_active
ON positions(work_location_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_temporary_workers_active
ON temporary_workers(id)
WHERE deleted_at IS NULL;
```

### 3.5. Indeks GIN dla wyszukiwania tekstowego

```sql
-- Wymagane rozszerzenie
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indeks dla fuzzy search pracowników
CREATE INDEX idx_workers_search
ON temporary_workers
USING GIN ((first_name || ' ' || last_name || ' ' || phone) gin_trgm_ops)
WHERE deleted_at IS NULL;
```

### 3.6. Indeks dla logów audytowych

```sql
-- Indeks dla wyszukiwania logów po dacie
CREATE INDEX idx_audit_log_created_at
ON assignment_audit_log(created_at DESC);
```

---

## 4. Zasady PostgreSQL (Row Level Security)

### 4.1. Włączenie RLS dla tabel

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_audit_log ENABLE ROW LEVEL SECURITY;
```

### 4.2. Funkcja pomocnicza do sprawdzania roli

```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 4.3. Polityki dla tabeli `profiles`

```sql
-- Odczyt: użytkownik widzi wszystkie profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (true);

-- Insert: tylko podczas rejestracji (triggered by auth)
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Update: admin może aktualizować wszystkich, użytkownik tylko siebie
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (
    auth.user_role() = 'admin' OR id = auth.uid()
  );

-- Delete: tylko admin
CREATE POLICY profiles_delete ON profiles
  FOR DELETE USING (auth.user_role() = 'admin');
```

### 4.4. Polityki dla tabeli `clients`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY clients_select ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update/Delete: tylko admin
CREATE POLICY clients_insert ON clients
  FOR INSERT WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY clients_update ON clients
  FOR UPDATE USING (auth.user_role() = 'admin');

CREATE POLICY clients_delete ON clients
  FOR DELETE USING (auth.user_role() = 'admin');
```

### 4.5. Polityki dla tabeli `work_locations`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY work_locations_select ON work_locations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update/Delete: tylko admin
CREATE POLICY work_locations_insert ON work_locations
  FOR INSERT WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY work_locations_update ON work_locations
  FOR UPDATE USING (auth.user_role() = 'admin');

CREATE POLICY work_locations_delete ON work_locations
  FOR DELETE USING (auth.user_role() = 'admin');
```

### 4.6. Polityki dla tabeli `positions`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY positions_select ON positions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update/Delete: wszyscy zalogowani (koordynatorzy i admini)
CREATE POLICY positions_insert ON positions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY positions_update ON positions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY positions_delete ON positions
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

### 4.7. Polityki dla tabeli `temporary_workers`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY workers_select ON temporary_workers
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update/Delete: wszyscy zalogowani (koordynatorzy i admini)
CREATE POLICY workers_insert ON temporary_workers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY workers_update ON temporary_workers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY workers_delete ON temporary_workers
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

### 4.8. Polityki dla tabeli `assignments`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY assignments_select ON assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update: wszyscy zalogowani (koordynatorzy i admini)
CREATE POLICY assignments_insert ON assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY assignments_update ON assignments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Delete: tylko admin (anulowanie przez zmianę statusu, nie DELETE)
CREATE POLICY assignments_delete ON assignments
  FOR DELETE USING (auth.user_role() = 'admin');
```

### 4.9. Polityki dla tabeli `assignment_audit_log`

```sql
-- Odczyt: wszyscy zalogowani użytkownicy
CREATE POLICY audit_log_select ON assignment_audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert: wszyscy zalogowani (automatycznie przez triggery)
CREATE POLICY audit_log_insert ON assignment_audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update/Delete: tylko admin (w sytuacjach awaryjnych)
CREATE POLICY audit_log_update ON assignment_audit_log
  FOR UPDATE USING (auth.user_role() = 'admin');

CREATE POLICY audit_log_delete ON assignment_audit_log
  FOR DELETE USING (auth.user_role() = 'admin');
```

---

## 5. Funkcje i triggery

### 5.1. Funkcja automatycznej aktualizacji `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery dla wszystkich tabel z kolumną updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_locations_updated_at
  BEFORE UPDATE ON work_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_temporary_workers_updated_at
  BEFORE UPDATE ON temporary_workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2. Funkcja normalizacji numeru telefonu

```sql
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Usuń wszystkie znaki niebędące cyframi
  RETURN regexp_replace(phone, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION normalize_phone_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone = normalize_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_worker_phone
  BEFORE INSERT OR UPDATE ON temporary_workers
  FOR EACH ROW EXECUTE FUNCTION normalize_phone_trigger();
```

### 5.3. Trigger dla logów audytowych

```sql
CREATE OR REPLACE FUNCTION log_assignment_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_name VARCHAR(50);
  old_vals JSONB := NULL;
  new_vals JSONB := NULL;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_name := 'created';
    new_vals := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_vals := to_jsonb(OLD);
    new_vals := to_jsonb(NEW);

    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      action_name := 'ended';
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      action_name := 'cancelled';
    ELSE
      action_name := 'updated';
    END IF;
  END IF;

  INSERT INTO assignment_audit_log (
    assignment_id,
    action,
    old_values,
    new_values,
    performed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_name,
    old_vals,
    new_vals,
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_assignment_changes_trigger
  AFTER INSERT OR UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION log_assignment_changes();
```

### 5.4. Funkcja sprawdzania dostępności pracownika

```sql
CREATE OR REPLACE FUNCTION is_worker_available(
  p_worker_id UUID,
  p_check_datetime TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM assignments
    WHERE worker_id = p_worker_id
      AND status IN ('scheduled', 'active')
      AND start_at <= p_check_datetime
      AND (end_at IS NULL OR end_at > p_check_datetime)
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### 5.5. Funkcja RPC dla raportu przepracowanych godzin

```sql
CREATE OR REPLACE FUNCTION get_hours_report(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_client_id UUID DEFAULT NULL
)
RETURNS TABLE (
  worker_id UUID,
  worker_name TEXT,
  work_location_name VARCHAR(255),
  client_name VARCHAR(255),
  total_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tw.id AS worker_id,
    (tw.first_name || ' ' || tw.last_name) AS worker_name,
    wl.name AS work_location_name,
    c.name AS client_name,
    ROUND(
      EXTRACT(EPOCH FROM SUM(
        LEAST(COALESCE(a.end_at, NOW()), p_end_date) -
        GREATEST(a.start_at, p_start_date)
      )) / 3600,
      2
    ) AS total_hours
  FROM assignments a
  JOIN temporary_workers tw ON a.worker_id = tw.id
  JOIN positions p ON a.position_id = p.id
  JOIN work_locations wl ON p.work_location_id = wl.id
  JOIN clients c ON wl.client_id = c.id
  WHERE a.status IN ('active', 'completed')
    AND a.start_at < p_end_date
    AND (a.end_at IS NULL OR a.end_at > p_start_date)
    AND tw.deleted_at IS NULL
    AND (p_client_id IS NULL OR c.id = p_client_id)
  GROUP BY tw.id, tw.first_name, tw.last_name, wl.name, c.name
  ORDER BY worker_name, work_location_name;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 5.6. Funkcja RPC do zakończenia przypisania

```sql
CREATE OR REPLACE FUNCTION end_assignment(
  p_assignment_id UUID,
  p_end_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS assignments AS $$
DECLARE
  v_assignment assignments;
BEGIN
  UPDATE assignments
  SET
    end_at = p_end_at,
    status = 'completed',
    ended_by = auth.uid()
  WHERE id = p_assignment_id
    AND status IN ('scheduled', 'active')
    AND end_at IS NULL
  RETURNING * INTO v_assignment;

  IF v_assignment IS NULL THEN
    RAISE EXCEPTION 'Assignment not found or already ended';
  END IF;

  RETURN v_assignment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.7. Funkcja RPC do anulowania przypisania

```sql
CREATE OR REPLACE FUNCTION cancel_assignment(
  p_assignment_id UUID
)
RETURNS assignments AS $$
DECLARE
  v_assignment assignments;
BEGIN
  UPDATE assignments
  SET
    status = 'cancelled',
    cancelled_by = auth.uid()
  WHERE id = p_assignment_id
    AND status = 'scheduled'
    AND start_at > NOW()
  RETURNING * INTO v_assignment;

  IF v_assignment IS NULL THEN
    RAISE EXCEPTION 'Assignment cannot be cancelled (not found, already started, or not in scheduled status)';
  END IF;

  RETURN v_assignment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Wymagane rozszerzenia PostgreSQL

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigram search for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 7. Uwagi dodatkowe i decyzje projektowe

### 7.1. Soft Delete

Wszystkie główne encje biznesowe (`clients`, `work_locations`, `positions`, `temporary_workers`) implementują wzorzec soft delete z kolumną `deleted_at`. Pozwala to na:
- Zachowanie integralności danych historycznych
- Możliwość audytu i odzyskania rekordów
- Poprawne generowanie raportów z przeszłości

### 7.2. Nakładające się przypisania

Zgodnie z PRD, system **nie blokuje** nakładających się czasowo przypisań dla jednego pracownika. Odpowiedzialność za weryfikację spoczywa na Koordynatorze. Funkcja `is_worker_available()` jest dostępna dla warstwy aplikacji do informowania użytkownika, ale nie wymusza ograniczeń.

### 7.3. Status przypisania

Enum `assignment_status` zawiera cztery wartości:
- `scheduled` - przypisanie zaplanowane, jeszcze nie rozpoczęte
- `active` - przypisanie w trakcie realizacji
- `completed` - przypisanie zakończone
- `cancelled` - przypisanie anulowane

Zmiana statusu na `active` może być realizowana przez aplikację lub trigger (decyzja implementacyjna).

### 7.4. Audit Log

Tabela `assignment_audit_log` jest append-only. Operacje UPDATE i DELETE są ograniczone przez RLS tylko do Administratorów (na wypadek sytuacji awaryjnych). W normalnym użytkowaniu logi są tylko dodawane.

### 7.5. Normalizacja telefonu

Trigger automatycznie normalizuje numery telefonów do czystego formatu numerycznego przed zapisem, co eliminuje problemy z duplikatami wynikającymi z różnych formatów zapisu.

### 7.6. Strefy czasowe

Wszystkie kolumny czasowe używają typu `TIMESTAMPTZ` (timestamp with time zone), co zapewnia poprawną obsługę stref czasowych i eliminuje problemy z konwersją.

### 7.7. Cascading Deletes

- `profiles` → CASCADE przy usunięciu `auth.users` (Supabase Auth)
- `assignment_audit_log` → CASCADE przy usunięciu `assignments` (zachowanie logów dla usuniętych przypisań nie ma sensu)
- Pozostałe relacje → RESTRICT (ochrona integralności danych)

### 7.8. Migracje

Schemat powinien być implementowany przez Supabase CLI z migracjami przechowywanymi w katalogu `supabase/migrations/`. Zalecana kolejność migracji:

1. Extensions (`pgcrypto`, `pg_trgm`)
2. Enum types (`user_role`, `assignment_status`)
3. Tables (w kolejności zależności)
4. Indexes
5. Functions and triggers
6. RLS policies
