# Database Schema Reference

Complete database schema for the One Staff Dashboard MVP.

## Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    │ 1:1 (ON DELETE CASCADE)
    ▼
profiles (id, role, first_name, last_name)
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

## ENUM Types

### user_role

```sql
CREATE TYPE user_role AS ENUM ('admin', 'coordinator');
```

- **admin** - Full access to all operations including client/location management
- **coordinator** - Manages daily operations (workers, assignments, positions)

### assignment_status

```sql
CREATE TYPE assignment_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
```

- **scheduled** - Assignment planned for future
- **active** - Assignment currently in progress
- **completed** - Assignment finished normally
- **cancelled** - Assignment cancelled before start

## Tables

### profiles

Extends Supabase Auth users with application-specific data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Links to Supabase Auth |
| role | user_role | NOT NULL, DEFAULT 'coordinator' | User permission level |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### clients

Agency client companies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NOT NULL | Client company name |
| email | VARCHAR(255) | NULL | Contact email |
| phone | VARCHAR(20) | NULL | Contact phone |
| address | TEXT | NULL | Physical address |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

### work_locations

Physical work locations belonging to clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| client_id | UUID | NOT NULL, FK → clients(id) ON DELETE RESTRICT | Parent client |
| name | VARCHAR(255) | NOT NULL | Location name |
| address | TEXT | NULL | Physical address |
| email | VARCHAR(255) | NULL | Location contact email |
| phone | VARCHAR(20) | NULL | Location contact phone |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

### positions

Job positions available at work locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| work_location_id | UUID | NOT NULL, FK → work_locations(id) ON DELETE RESTRICT | Parent location |
| name | VARCHAR(255) | NOT NULL | Position name |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether accepting assignments |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

### temporary_workers

Temporary workers managed by the agency (no system login).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| first_name | VARCHAR(100) | NOT NULL | Worker's first name |
| last_name | VARCHAR(100) | NOT NULL | Worker's last name |
| phone | VARCHAR(20) | NOT NULL, UNIQUE | Phone (auto-normalized) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

### assignments

Worker assignments to positions (core scheduling entity).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| worker_id | UUID | NOT NULL, FK → temporary_workers(id) ON DELETE RESTRICT | Assigned worker |
| position_id | UUID | NOT NULL, FK → positions(id) ON DELETE RESTRICT | Target position |
| start_at | TIMESTAMPTZ | NOT NULL | Assignment start time |
| end_at | TIMESTAMPTZ | NULL, CHECK (end_at > start_at) | End time (NULL = ongoing) |
| status | assignment_status | NOT NULL, DEFAULT 'scheduled' | Current status |
| created_by | UUID | NOT NULL, FK → profiles(id) | Coordinator who created |
| ended_by | UUID | NULL, FK → profiles(id) | Coordinator who ended |
| cancelled_by | UUID | NULL, FK → profiles(id) | Coordinator who cancelled |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Note:** Overlapping assignments are permitted by design (coordinator responsibility).

### assignment_audit_log

Immutable audit trail for assignment operations (append-only).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| assignment_id | UUID | NOT NULL, FK → assignments(id) ON DELETE CASCADE | Related assignment |
| action | VARCHAR(50) | NOT NULL | Operation type |
| old_values | JSONB | NULL | State before change |
| new_values | JSONB | NULL | State after change |
| performed_by | UUID | NOT NULL, FK → profiles(id) | User who performed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Operation timestamp |

**Action values:** 'created', 'updated', 'ended', 'cancelled'

## Key Indexes

### Foreign Key Indexes

```sql
CREATE INDEX idx_work_locations_client_id ON work_locations(client_id);
CREATE INDEX idx_positions_work_location_id ON positions(work_location_id);
CREATE INDEX idx_assignments_worker_id ON assignments(worker_id);
CREATE INDEX idx_assignments_position_id ON assignments(position_id);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);
CREATE INDEX idx_audit_log_assignment_id ON assignment_audit_log(assignment_id);
```

### Composite Indexes for Reports

```sql
-- Worker assignments by date range
CREATE INDEX idx_assignments_worker_dates ON assignments(worker_id, start_at, end_at);

-- Position assignments
CREATE INDEX idx_assignments_position_start ON assignments(position_id, start_at);

-- Active positions at location
CREATE INDEX idx_positions_location_active ON positions(work_location_id, is_active)
  WHERE deleted_at IS NULL;
```

### Partial Indexes (Soft Delete)

```sql
CREATE INDEX idx_clients_active ON clients(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_locations_active ON work_locations(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_positions_active ON positions(work_location_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_temporary_workers_active ON temporary_workers(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_completed ON assignments(worker_id, start_at, end_at)
  WHERE status = 'completed';
```

### Full-Text Search Index

```sql
CREATE INDEX idx_workers_search ON temporary_workers
  USING GIN ((first_name || ' ' || last_name || ' ' || phone) gin_trgm_ops)
  WHERE deleted_at IS NULL;
```

## TypeScript Types

After generating types with `pnpm supabase gen types typescript --local`:

```typescript
import type { Database } from '@/lib/supabase/database.types'

// Table row types
type Profile = Database['public']['Tables']['profiles']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type WorkLocation = Database['public']['Tables']['work_locations']['Row']
type Position = Database['public']['Tables']['positions']['Row']
type TemporaryWorker = Database['public']['Tables']['temporary_workers']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']
type AuditLog = Database['public']['Tables']['assignment_audit_log']['Row']

// Insert types
type ClientInsert = Database['public']['Tables']['clients']['Insert']
type AssignmentInsert = Database['public']['Tables']['assignments']['Insert']

// Update types
type ClientUpdate = Database['public']['Tables']['clients']['Update']
type AssignmentUpdate = Database['public']['Tables']['assignments']['Update']

// Enum types
type UserRole = Database['public']['Enums']['user_role']
type AssignmentStatus = Database['public']['Enums']['assignment_status']
```
