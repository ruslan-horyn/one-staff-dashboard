# Row Level Security (RLS) Policies Reference

Complete RLS policies for the One Staff Dashboard.

## Role Helper Function

```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

Use in policies: `auth.user_role() = 'admin'`

## Policy Summary by Table

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | All authenticated | Own only | Admin or own | Admin only |
| clients | All authenticated | Admin only | Admin only | Admin only |
| work_locations | All authenticated | Admin only | Admin only | Admin only |
| positions | All authenticated | All authenticated | All authenticated | All authenticated |
| temporary_workers | All authenticated | All authenticated | All authenticated | All authenticated |
| assignments | All authenticated | All authenticated | All authenticated | Admin only |
| assignment_audit_log | All authenticated | All authenticated | Admin only | Admin only |

## Detailed Policies

### profiles

```sql
-- SELECT: All authenticated users can view all profiles
CREATE POLICY profiles_select_authenticated ON profiles
  FOR SELECT TO authenticated USING (true);

-- INSERT: Users can only insert their own profile
CREATE POLICY profiles_insert_authenticated ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- UPDATE: Admin can update all, users can update own
CREATE POLICY profiles_update_authenticated ON profiles
  FOR UPDATE TO authenticated
  USING (auth.user_role() = 'admin' OR id = auth.uid());

-- DELETE: Admin only
CREATE POLICY profiles_delete_authenticated ON profiles
  FOR DELETE TO authenticated USING (auth.user_role() = 'admin');
```

### clients

```sql
-- SELECT: All authenticated can read
CREATE POLICY clients_select_authenticated ON clients
  FOR SELECT TO authenticated USING (true);

-- INSERT: Admin only
CREATE POLICY clients_insert_authenticated ON clients
  FOR INSERT TO authenticated WITH CHECK (auth.user_role() = 'admin');

-- UPDATE: Admin only
CREATE POLICY clients_update_authenticated ON clients
  FOR UPDATE TO authenticated USING (auth.user_role() = 'admin');

-- DELETE: Admin only
CREATE POLICY clients_delete_authenticated ON clients
  FOR DELETE TO authenticated USING (auth.user_role() = 'admin');
```

### work_locations

```sql
-- SELECT: All authenticated can read
CREATE POLICY work_locations_select_authenticated ON work_locations
  FOR SELECT TO authenticated USING (true);

-- INSERT: Admin only
CREATE POLICY work_locations_insert_authenticated ON work_locations
  FOR INSERT TO authenticated WITH CHECK (auth.user_role() = 'admin');

-- UPDATE: Admin only
CREATE POLICY work_locations_update_authenticated ON work_locations
  FOR UPDATE TO authenticated USING (auth.user_role() = 'admin');

-- DELETE: Admin only
CREATE POLICY work_locations_delete_authenticated ON work_locations
  FOR DELETE TO authenticated USING (auth.user_role() = 'admin');
```

### positions

```sql
-- SELECT: All authenticated can read
CREATE POLICY positions_select_authenticated ON positions
  FOR SELECT TO authenticated USING (true);

-- INSERT: All authenticated (coordinators manage positions)
CREATE POLICY positions_insert_authenticated ON positions
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: All authenticated
CREATE POLICY positions_update_authenticated ON positions
  FOR UPDATE TO authenticated USING (true);

-- DELETE: All authenticated (soft delete preferred)
CREATE POLICY positions_delete_authenticated ON positions
  FOR DELETE TO authenticated USING (true);
```

### temporary_workers

```sql
-- SELECT: All authenticated can read
CREATE POLICY workers_select_authenticated ON temporary_workers
  FOR SELECT TO authenticated USING (true);

-- INSERT: All authenticated (coordinators onboard workers)
CREATE POLICY workers_insert_authenticated ON temporary_workers
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: All authenticated
CREATE POLICY workers_update_authenticated ON temporary_workers
  FOR UPDATE TO authenticated USING (true);

-- DELETE: All authenticated (soft delete preferred)
CREATE POLICY workers_delete_authenticated ON temporary_workers
  FOR DELETE TO authenticated USING (true);
```

### assignments

```sql
-- SELECT: All authenticated can read
CREATE POLICY assignments_select_authenticated ON assignments
  FOR SELECT TO authenticated USING (true);

-- INSERT: All authenticated (core coordinator function)
CREATE POLICY assignments_insert_authenticated ON assignments
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: All authenticated (end/modify assignments)
CREATE POLICY assignments_update_authenticated ON assignments
  FOR UPDATE TO authenticated USING (true);

-- DELETE: Admin only (use status change instead)
CREATE POLICY assignments_delete_authenticated ON assignments
  FOR DELETE TO authenticated USING (auth.user_role() = 'admin');
```

### assignment_audit_log

```sql
-- SELECT: All authenticated can read
CREATE POLICY audit_log_select_authenticated ON assignment_audit_log
  FOR SELECT TO authenticated USING (true);

-- INSERT: All authenticated (created by triggers)
CREATE POLICY audit_log_insert_authenticated ON assignment_audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Admin only (emergency corrections)
CREATE POLICY audit_log_update_authenticated ON assignment_audit_log
  FOR UPDATE TO authenticated USING (auth.user_role() = 'admin');

-- DELETE: Admin only (emergency use)
CREATE POLICY audit_log_delete_authenticated ON assignment_audit_log
  FOR DELETE TO authenticated USING (auth.user_role() = 'admin');
```

## Anonymous User Policies

All tables have policies blocking anonymous access:

```sql
CREATE POLICY table_select_anon ON table_name
  FOR SELECT TO anon USING (false);

CREATE POLICY table_insert_anon ON table_name
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY table_update_anon ON table_name
  FOR UPDATE TO anon USING (false);

CREATE POLICY table_delete_anon ON table_name
  FOR DELETE TO anon USING (false);
```

## Common Policy Patterns

### Admin-only write access

```sql
CREATE POLICY table_insert ON table_name
  FOR INSERT TO authenticated
  WITH CHECK (auth.user_role() = 'admin');
```

### All authenticated can read

```sql
CREATE POLICY table_select ON table_name
  FOR SELECT TO authenticated USING (true);
```

### User can modify own record

```sql
CREATE POLICY table_update ON table_name
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
```

### Admin or owner can modify

```sql
CREATE POLICY table_update ON table_name
  FOR UPDATE TO authenticated
  USING (auth.user_role() = 'admin' OR user_id = auth.uid());
```

## Testing RLS Policies

### In Supabase SQL Editor

```sql
-- Impersonate a user
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Test query
SELECT * FROM clients;

-- Reset
RESET request.jwt.claims;
```

### In Application Code

```typescript
// Verify RLS is working by checking that:
// 1. Unauthenticated requests fail
// 2. Wrong role requests fail
// 3. Correct role requests succeed

const { data, error } = await supabase
  .from('clients')
  .insert({ name: 'Test' })

if (error?.code === '42501') {
  // RLS policy violation - as expected for non-admin
}
```
