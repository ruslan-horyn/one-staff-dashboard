# Database Seeding Guide

This document covers database seeding strategies for local development.

## Current Approach: Raw SQL

We use a raw SQL seed file that runs automatically on `supabase db reset`.

**Location:** `supabase/seed.sql`

### Test Users

| Email | Password | Role | User ID |
|-------|----------|------|---------|
| `admin@test.com` | `password123` | admin | `d0d0d0d0-0000-0000-0000-000000000001` |
| `coordinator@test.com` | `password123` | coordinator | `d0d0d0d0-0000-0000-0000-000000000002` |

### Commands

```bash
# Reset database and apply seed
pnpm supabase db reset

# Verify seeded users work
pnpm test:auth
```

### Seed File Structure

The seed file inserts data into:

1. **auth.users** - Supabase Auth user records
2. **auth.identities** - Identity provider records (required for email/password login)
3. **profiles** - Application user profiles with roles

#### Important: Required auth.users Columns

When manually inserting into `auth.users`, these columns must have non-NULL values:

```sql
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  -- These MUST be empty strings, not NULL
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (...);
```

Without these columns, GoTrue (Supabase Auth service) will fail with:
```
Database error querying schema
```

---

## Alternative: Snaplet Seed (Type-Safe Seeding)

[Snaplet Seed](https://snaplet-seed.netlify.app/) provides type-safe, programmatic database seeding.

### Installation

```bash
# Install adapter
pnpm add -D postgres @snaplet/seed

# Initialize
npx @snaplet/seed init
```

### Configuration

Create `seed.config.ts`:

```typescript
import { SeedPostgres } from "@snaplet/seed/adapter-postgres";
import { defineConfig } from "@snaplet/seed/config";
import postgres from "postgres";

export default defineConfig({
  adapter: () => {
    const client = postgres("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
    return new SeedPostgres(client);
  },
  select: [
    "!*",              // Exclude extensions
    "public*",         // Include public schema
    "auth.users",      // Include auth tables
    "auth.identities",
    "auth.sessions",
  ]
});
```

### Sync After Migrations

```bash
npx @snaplet/seed sync
```

Run this after any database schema changes.

### Example Seed Script

```typescript
// seed.ts
import { createSeedClient } from "@snaplet/seed";

async function main() {
  const seed = await createSeedClient();

  // Clear existing data
  await seed.$resetDatabase();

  // Seed users
  await seed.auth_users([
    {
      id: "d0d0d0d0-0000-0000-0000-000000000001",
      email: "admin@test.com",
      // ... other fields
    }
  ]);

  // Seed profiles
  await seed.profiles([
    {
      id: "d0d0d0d0-0000-0000-0000-000000000001",
      first_name: "Test",
      last_name: "Admin",
      role: "admin"
    }
  ]);

  console.log("Seeding complete!");
}

main();
```

### Export to SQL (Supabase Integration)

Generate SQL file for Supabase's native seeding:

```typescript
const seed = await createSeedClient({ dryRun: true });
// ... seed operations
```

```bash
npx tsx seed.ts > supabase/seed.sql
```

---

## Debugging Auth Issues

If seeded users fail to authenticate:

### 1. Check Auth Service Logs

```bash
docker logs supabase_auth_one-staff-dashboard 2>&1 | tail -50
```

### 2. Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Database error querying schema` | NULL token columns in auth.users | Add empty string values for token columns |
| `Invalid login credentials` | Wrong password hash | Use `crypt('password', gen_salt('bf'))` |
| `Email not confirmed` | Missing `email_confirmed_at` | Set to `now()` in seed |

### 3. Verify Users Exist

```bash
# Via Supabase Studio
open http://127.0.0.1:54323

# Navigate to: Authentication > Users
```

---

## Best Practices

1. **Always use `db reset`** - Don't manually run seed.sql, use `supabase db reset`
2. **Test after seeding** - Run `pnpm test:auth` to verify auth works
3. **Keep passwords simple** - Use `password123` for all test users
4. **Use consistent UUIDs** - Makes debugging easier
5. **Sync Snaplet after migrations** - If using Snaplet, run `sync` after schema changes

## Related Files

- `supabase/seed.sql` - Seed data
- `scripts/test-auth.ts` - Auth verification script
- `supabase/migrations/` - Database schema
