# RPC Functions Reference

Database functions available via `supabase.rpc()`.

## auth.user_role()

Returns the role of the currently authenticated user.

```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Usage:** Internal use in RLS policies only.

---

## is_worker_available()

Check if a worker is available at a specific datetime.

### Signature

```sql
is_worker_available(
  p_worker_id UUID,
  p_check_datetime TIMESTAMPTZ
) RETURNS BOOLEAN
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| p_worker_id | UUID | Worker to check |
| p_check_datetime | TIMESTAMPTZ | DateTime to check availability |

### Returns

- `true` - Worker has no active/scheduled assignments at that time
- `false` - Worker has a conflicting assignment

### Example

```typescript
const { data: isAvailable, error } = await supabase.rpc('is_worker_available', {
  p_worker_id: '123e4567-e89b-12d3-a456-426614174000',
  p_check_datetime: new Date().toISOString(),
})

if (isAvailable) {
  // Worker is free
} else {
  // Worker has an assignment at this time
}
```

### Notes

- This is **informational only** - overlapping assignments are permitted by design
- Returns `true` if worker has no `scheduled` or `active` assignments overlapping the datetime
- Does not check `completed` or `cancelled` assignments

---

## get_hours_report()

Generate a report of worked hours for a date range.

### Signature

```sql
get_hours_report(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_client_id UUID DEFAULT NULL
) RETURNS TABLE (
  worker_id UUID,
  worker_name TEXT,
  work_location_name VARCHAR(255),
  client_name VARCHAR(255),
  total_hours NUMERIC
)
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| p_start_date | TIMESTAMPTZ | Report period start |
| p_end_date | TIMESTAMPTZ | Report period end |
| p_client_id | UUID (optional) | Filter by client |

### Returns

Table with columns:

| Column | Type | Description |
|--------|------|-------------|
| worker_id | UUID | Worker's unique ID |
| worker_name | TEXT | Full name (first + last) |
| work_location_name | VARCHAR(255) | Location name |
| client_name | VARCHAR(255) | Client company name |
| total_hours | NUMERIC | Hours worked (2 decimal places) |

### Example

```typescript
// Get hours for all workers in December 2024
const { data: report, error } = await supabase.rpc('get_hours_report', {
  p_start_date: '2024-12-01T00:00:00Z',
  p_end_date: '2024-12-31T23:59:59Z',
})

// Get hours for specific client
const { data: clientReport, error } = await supabase.rpc('get_hours_report', {
  p_start_date: '2024-12-01T00:00:00Z',
  p_end_date: '2024-12-31T23:59:59Z',
  p_client_id: 'client-uuid-here',
})

// Export to CSV
const csvContent = report?.map(row =>
  `${row.worker_name},${row.work_location_name},${row.client_name},${row.total_hours}`
).join('\n')
```

### Notes

- Only includes `active` and `completed` assignments
- Properly handles partial overlaps with date range
- Ongoing assignments (end_at = NULL) use current time for calculation
- Results grouped by worker and location
- Sorted by worker name, then location name

---

## end_assignment()

End an active or scheduled assignment.

### Signature

```sql
end_assignment(
  p_assignment_id UUID,
  p_end_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS assignments
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| p_assignment_id | UUID | Assignment to end |
| p_end_at | TIMESTAMPTZ (optional) | End timestamp (defaults to now) |

### Returns

The updated assignment record.

### Exceptions

- `'Assignment not found or already ended'` - If assignment doesn't exist, is already completed/cancelled, or already has an end_at value

### Example

```typescript
// End assignment now
const { data: assignment, error } = await supabase.rpc('end_assignment', {
  p_assignment_id: 'assignment-uuid-here',
})

// End assignment at specific time
const { data: assignment, error } = await supabase.rpc('end_assignment', {
  p_assignment_id: 'assignment-uuid-here',
  p_end_at: '2024-12-15T17:00:00Z',
})

if (error) {
  if (error.message.includes('not found or already ended')) {
    // Handle gracefully
  }
}
```

### Side Effects

- Sets `end_at` to provided timestamp
- Sets `status` to `'completed'`
- Sets `ended_by` to current user (auth.uid())
- Triggers audit log entry with action `'ended'`

---

## cancel_assignment()

Cancel a scheduled assignment that hasn't started yet.

### Signature

```sql
cancel_assignment(
  p_assignment_id UUID
) RETURNS assignments
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| p_assignment_id | UUID | Assignment to cancel |

### Returns

The updated assignment record.

### Exceptions

- `'Assignment cannot be cancelled (not found, already started, or not in scheduled status)'` - If:
  - Assignment doesn't exist
  - Assignment has already started (start_at <= now)
  - Assignment is not in `scheduled` status

### Example

```typescript
const { data: assignment, error } = await supabase.rpc('cancel_assignment', {
  p_assignment_id: 'assignment-uuid-here',
})

if (error) {
  if (error.message.includes('cannot be cancelled')) {
    // Show user-friendly error
    alert('This assignment has already started and cannot be cancelled')
  }
}
```

### Side Effects

- Sets `status` to `'cancelled'`
- Sets `cancelled_by` to current user (auth.uid())
- Triggers audit log entry with action `'cancelled'`

### Validation

- Only works for assignments with `status = 'scheduled'`
- Only works for assignments where `start_at > NOW()`

---

## normalize_phone()

Normalize phone numbers to digits only.

### Signature

```sql
normalize_phone(phone TEXT) RETURNS TEXT
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| phone | TEXT | Phone number to normalize |

### Returns

Phone number with all non-digit characters removed.

### Example

```sql
SELECT normalize_phone('+48 123-456-789');
-- Returns: '48123456789'

SELECT normalize_phone('(123) 456-7890');
-- Returns: '1234567890'
```

### Notes

- Automatically applied via trigger on `temporary_workers` table
- Ensures unique constraint works regardless of input format
- No need to call manually - trigger handles it

---

## TypeScript Types for RPC

```typescript
// Define return types for RPC functions
interface HoursReportRow {
  worker_id: string
  worker_name: string
  work_location_name: string
  client_name: string
  total_hours: number
}

// Usage with type safety
const { data } = await supabase
  .rpc('get_hours_report', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  })
  .returns<HoursReportRow[]>()

// Type from database.types.ts
type Assignment = Database['public']['Tables']['assignments']['Row']
const { data } = await supabase
  .rpc('end_assignment', { p_assignment_id: id })
  .returns<Assignment>()
```
