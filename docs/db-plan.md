# Schemat bazy danych - One Staff Dashboard MVP

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### 1.1. Tabela `organizations`

Organizacje/firmy korzystające z systemu. Umożliwia multi-tenancy.

| Kolumna      | Typ danych                          | Ograniczenia                                           |
|--------------|-------------------------------------|--------------------------------------------------------|
| id           | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| name         | VARCHAR(255)                        | NOT NULL                                               |
| created_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at   | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |

---

### 1.2. Tabela `profiles`

Rozszerzenie wbudowanej tabeli `auth.users` z Supabase Auth.

| Kolumna         | Typ danych                          | Ograniczenia                                           |
|-----------------|-------------------------------------|--------------------------------------------------------|
| id              | UUID                                | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE |
| organization_id | UUID                                | NOT NULL, REFERENCES organizations(id) ON DELETE RESTRICT |
| role            | user_role (ENUM)                    | NOT NULL, DEFAULT 'coordinator'                        |
| first_name      | VARCHAR(100)                        | NOT NULL                                               |
| last_name       | VARCHAR(100)                        | NOT NULL                                               |
| created_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |

**Typ ENUM `user_role`:**

```sql
CREATE TYPE user_role AS ENUM ('admin', 'coordinator');
```

---

### 1.3. Tabela `clients`

Przechowuje dane klientów agencji. Każdy klient należy do jednej organizacji (multi-tenancy).

| Kolumna         | Typ danych                          | Ograniczenia                                           |
|-----------------|-------------------------------------|--------------------------------------------------------|
| id              | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| organization_id | UUID                                | NOT NULL, REFERENCES organizations(id) ON DELETE RESTRICT |
| name            | VARCHAR(255)                        | NOT NULL                                               |
| email           | VARCHAR(255)                        | NOT NULL                                               |
| phone           | VARCHAR(20)                         | NOT NULL                                               |
| address         | TEXT                                | NOT NULL                                               |
| created_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at      | TIMESTAMPTZ                         | NULL (soft delete)                                     |

---

### 1.4. Tabela `work_locations`

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

### 1.5. Tabela `positions`

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

### 1.6. Tabela `temporary_workers`

Pracownicy tymczasowi. Każdy pracownik należy do jednej organizacji (multi-tenancy).

| Kolumna         | Typ danych                          | Ograniczenia                                           |
|-----------------|-------------------------------------|--------------------------------------------------------|
| id              | UUID                                | PRIMARY KEY, DEFAULT gen_random_uuid()                 |
| organization_id | UUID                                | NOT NULL, REFERENCES organizations(id) ON DELETE RESTRICT |
| first_name      | VARCHAR(100)                        | NOT NULL                                               |
| last_name       | VARCHAR(100)                        | NOT NULL                                               |
| phone           | VARCHAR(20)                         | NOT NULL, UNIQUE                                       |
| created_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| updated_at      | TIMESTAMPTZ                         | NOT NULL, DEFAULT NOW()                                |
| deleted_at      | TIMESTAMPTZ                         | NULL (soft delete)                                     |

**Uwaga:** W przyszłości UNIQUE constraint na `phone` powinien być zmieniony na `UNIQUE(organization_id, phone)` dla pełnej izolacji per organizacja.

---

### 1.7. Tabela `assignments`

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

### 1.8. Tabela `assignment_audit_log`

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
profiles ◄──────────────────────────────┐
    │                                    │
    │ 1:N (created_by, ended_by,         │ N:1 (organization_id)
    │      cancelled_by)                 │
    ▼                                    │
assignments ◄────────────────────┐   organizations
    │                            │       │
    │ 1:N (ON DELETE CASCADE)    │       ├── 1:N (organization_id)
    ▼                            │       │
assignment_audit_log      temporary_workers
                                 │
                                 │ N:1 (worker_id, ON DELETE RESTRICT)
                                 ▼
                            assignments

clients ◄─────────────────── organizations
    │                            │
    │ 1:N (ON DELETE RESTRICT)   │ 1:N (organization_id)
    ▼                            │
work_locations                   │
    │                            │
    │ 1:N (ON DELETE RESTRICT)   │
    ▼                            │
positions                        │
    │                            │
    │ 1:N (ON DELETE RESTRICT)   │
    ▼                            │
assignments ◄────────────────────┘
```

### Szczegółowy opis relacji

| Relacja | Typ | Opis |
|---------|-----|------|
| organizations → profiles | 1:N | Organizacja może mieć wielu użytkowników |
| organizations → clients | 1:N | Organizacja może mieć wielu klientów |
| organizations → temporary_workers | 1:N | Organizacja może mieć wielu pracowników tymczasowych |
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
-- profiles
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);

-- clients (multi-tenancy)
CREATE INDEX idx_clients_organization_id ON clients(organization_id);

-- work_locations
CREATE INDEX idx_work_locations_client_id ON work_locations(client_id);

-- positions
CREATE INDEX idx_positions_work_location_id ON positions(work_location_id);

-- temporary_workers (multi-tenancy)
CREATE INDEX idx_workers_organization_id ON temporary_workers(organization_id);

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
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_audit_log ENABLE ROW LEVEL SECURITY;
```

### 4.2. Funkcje pomocnicze

```sql
-- Pobiera rolę użytkownika z JWT (ustawiane przez custom_access_token_hook)
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::user_role,
    'coordinator'::user_role
  )
$$ LANGUAGE sql STABLE;

-- Pobiera organization_id użytkownika z JWT
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() ->> 'organization_id')::uuid
$$ LANGUAGE sql STABLE;
```

### 4.3. Polityki dla tabeli `organizations`

```sql
-- Użytkownicy widzą tylko swoją organizację
CREATE POLICY organizations_select ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Insert: dozwolony przez trigger SECURITY DEFINER (handle_new_user)
CREATE POLICY organizations_insert ON organizations
  FOR INSERT WITH CHECK (true);

-- Update: tylko admin może zmienić nazwę organizacji
CREATE POLICY organizations_update ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND public.user_role() = 'admin'
  );
```

### 4.4. Polityki dla tabeli `profiles`

```sql
-- Odczyt: użytkownik widzi profile w swojej organizacji lub swój własny
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    organization_id = public.user_organization_id()
    OR id = auth.uid()
  );

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

### 4.5. Polityki dla tabeli `clients`

```sql
-- Odczyt: użytkownicy widzą tylko klientów swojej organizacji
CREATE POLICY clients_select ON clients
  FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- Insert: admin może dodawać klientów do swojej organizacji
CREATE POLICY clients_insert ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- Update: admin może aktualizować klientów swojej organizacji
CREATE POLICY clients_update ON clients
  FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- Delete: admin może usuwać klientów swojej organizacji
CREATE POLICY clients_delete ON clients
  FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY clients_anon ON clients
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

### 4.6. Polityki dla tabeli `work_locations`

```sql
-- Odczyt: użytkownicy widzą tylko lokalizacje klientów swojej organizacji
CREATE POLICY work_locations_select ON work_locations
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE organization_id = public.user_organization_id()
    )
  );

-- Insert: admin może dodawać lokalizacje do klientów swojej organizacji
CREATE POLICY work_locations_insert ON work_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- Update: admin może aktualizować lokalizacje klientów swojej organizacji
CREATE POLICY work_locations_update ON work_locations
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- Delete: admin może usuwać lokalizacje klientów swojej organizacji
CREATE POLICY work_locations_delete ON work_locations
  FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY work_locations_anon ON work_locations
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

### 4.7. Polityki dla tabeli `positions`

```sql
-- Odczyt: użytkownicy widzą tylko stanowiska w lokalizacjach klientów swojej organizacji
CREATE POLICY positions_select ON positions
  FOR SELECT
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM work_locations wl
      JOIN clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- Insert: wszyscy zalogowani mogą dodawać stanowiska w swojej organizacji
CREATE POLICY positions_insert ON positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    work_location_id IN (
      SELECT wl.id FROM work_locations wl
      JOIN clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- Update: wszyscy zalogowani mogą aktualizować stanowiska swojej organizacji
CREATE POLICY positions_update ON positions
  FOR UPDATE
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM work_locations wl
      JOIN clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- Delete: wszyscy zalogowani mogą usuwać stanowiska swojej organizacji
CREATE POLICY positions_delete ON positions
  FOR DELETE
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM work_locations wl
      JOIN clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY positions_anon ON positions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

### 4.8. Polityki dla tabeli `temporary_workers`

```sql
-- Odczyt: użytkownicy widzą tylko pracowników swojej organizacji
CREATE POLICY workers_select ON temporary_workers
  FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- Insert: wszyscy zalogowani mogą dodawać pracowników do swojej organizacji
CREATE POLICY workers_insert ON temporary_workers
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

-- Update: wszyscy zalogowani mogą aktualizować pracowników swojej organizacji
CREATE POLICY workers_update ON temporary_workers
  FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- Delete: wszyscy zalogowani mogą usuwać pracowników swojej organizacji
CREATE POLICY workers_delete ON temporary_workers
  FOR DELETE
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY workers_anon ON temporary_workers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

### 4.9. Polityki dla tabeli `assignments`

```sql
-- Odczyt: użytkownicy widzą tylko przypisania pracowników swojej organizacji
CREATE POLICY assignments_select ON assignments
  FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
  );

-- Insert: wszyscy zalogowani mogą tworzyć przypisania dla pracowników i stanowisk swojej organizacji
CREATE POLICY assignments_insert ON assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
    AND position_id IN (
      SELECT p.id FROM positions p
      JOIN work_locations wl ON p.work_location_id = wl.id
      JOIN clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- Update: wszyscy zalogowani mogą aktualizować przypisania swojej organizacji
CREATE POLICY assignments_update ON assignments
  FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
  );

-- Delete: tylko admin może usuwać przypisania swojej organizacji
CREATE POLICY assignments_delete ON assignments
  FOR DELETE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY assignments_anon ON assignments
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

### 4.10. Polityki dla tabeli `assignment_audit_log`

```sql
-- Odczyt: użytkownicy widzą tylko logi przypisań swojej organizacji
CREATE POLICY audit_log_select ON assignment_audit_log
  FOR SELECT
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
  );

-- Insert: wszyscy zalogowani (automatycznie przez triggery)
CREATE POLICY audit_log_insert ON assignment_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
  );

-- Update: tylko admin z izolacją per organizacja (w sytuacjach awaryjnych)
CREATE POLICY audit_log_update ON assignment_audit_log
  FOR UPDATE
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- Delete: tylko admin z izolacją per organizacja (w sytuacjach awaryjnych)
CREATE POLICY audit_log_delete ON assignment_audit_log
  FOR DELETE
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: brak dostępu dla niezalogowanych
CREATE POLICY audit_log_anon ON assignment_audit_log
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
```

---

## 5. Funkcje i triggery

### 5.1. Auth Hook: handle_new_user()

Trigger uruchamiany przy rejestracji nowego użytkownika. Automatycznie tworzy organizację i profil.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Pobierz dane z user_metadata
  v_org_name := NEW.raw_user_meta_data->>'organization_name';
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  -- Utwórz nową organizację
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(v_org_name, 'My Organization'))
  RETURNING id INTO v_org_id;

  -- Utwórz profil użytkownika jako admin
  INSERT INTO public.profiles (id, organization_id, role, first_name, last_name)
  VALUES (NEW.id, v_org_id, 'admin', v_first_name, v_last_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.2. Auth Hook: custom_access_token_hook()

Supabase Auth Hook dodający `user_role` i `organization_id` do JWT claims.

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  profile_role public.user_role;
  profile_org_id uuid;
BEGIN
  -- Pobierz role i organization_id z profiles
  SELECT role, organization_id
  INTO profile_role, profile_org_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ustaw custom claims
  IF profile_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(profile_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"coordinator"');
  END IF;

  IF profile_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(profile_org_id));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Uprawnienia dla supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
GRANT SELECT ON TABLE public.organizations TO supabase_auth_admin;
```

**Konfiguracja w `supabase/config.toml`:**

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

### 5.3. Funkcja automatycznej aktualizacji `updated_at`

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

### 5.4. Funkcja normalizacji numeru telefonu

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

### 5.5. Trigger dla logów audytowych

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

### 5.6. Funkcja sprawdzania dostępności pracownika

```sql
CREATE OR REPLACE FUNCTION is_worker_available(
  p_worker_id UUID,
  p_check_datetime TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Sprawdź czy pracownik należy do organizacji użytkownika
  IF NOT EXISTS (
    SELECT 1 FROM temporary_workers
    WHERE id = p_worker_id
    AND organization_id = public.user_organization_id()
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM assignments
    WHERE worker_id = p_worker_id
      AND status IN ('scheduled', 'active')
      AND start_at <= p_check_datetime
      AND (end_at IS NULL OR end_at > p_check_datetime)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 5.7. Funkcja RPC dla raportu przepracowanych godzin

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
    AND tw.organization_id = public.user_organization_id()  -- Filtrowanie per organizacja
    AND (p_client_id IS NULL OR c.id = p_client_id)
  GROUP BY tw.id, tw.first_name, tw.last_name, wl.name, c.name
  ORDER BY worker_name, work_location_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 5.8. Funkcja RPC do zakończenia przypisania

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

### 5.9. Funkcja RPC do anulowania przypisania

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
