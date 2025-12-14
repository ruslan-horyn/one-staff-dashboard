---
name: Supabase Integration
description: This skill should be used when the user asks to "query supabase", "fetch data from database", "insert record", "create a migration", "add table", "supabase migrate", "write RLS policy", "supabase auth", "login user", "protect route", "create supabase client", or mentions Supabase, database queries, authentication, or Row Level Security in the context of the One Staff Dashboard project.
version: 0.1.0
---

# Supabase Integration for One Staff Dashboard

This skill provides guidance for working with Supabase in the One Staff Dashboard MVP project using **Next.js 16** with the App Router. Covers database queries, authentication, migrations, and Row Level Security (RLS) policies.

## Critical: Next.js 16 Changes

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The proxy runs on **Node.js runtime** (not Edge). For Supabase auth token refresh, use `proxy.ts`.

## Project Database Overview

The One Staff Dashboard uses Supabase PostgreSQL with the following core entities:

- **profiles** - User profiles extending Supabase Auth (admin/coordinator roles)
- **clients** - Staffing agency clients
- **work_locations** - Work locations belonging to clients
- **positions** - Job positions at work locations
- **temporary_workers** - Temporary staff members
- **assignments** - Worker assignments to positions
- **assignment_audit_log** - Immutable audit trail for assignments

For complete schema details, consult `references/schema.md`.

## Required Packages

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase Client Setup

### Server-Side Client (Next.js 16 App Router)

Create server-side Supabase clients for Server Components and Route Handlers. Note: `cookies()` is async in Next.js 15+.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components - proxy handles refresh
          }
        },
      },
    }
  )
}
```

### Browser Client

Create browser-side Supabase client for Client Components:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Proxy for Auth Token Refresh (Next.js 16)

In Next.js 16, use `proxy.ts` (not `middleware.ts`) to refresh sessions and protect routes:

```typescript
// proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Do not add code between createServerClient and getUser()
  const { data: { user } } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Authentication with Server Actions

### Login and Signup Actions

```typescript
// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Signup failed')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Login Page Component

```typescript
// app/login/page.tsx
import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />

      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}
```

### Protected Page (Server Component)

```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <p>Hello {user.email}</p>
      <p>Role: {profile?.role}</p>
    </div>
  )
}
```

## Database Queries

### Type Generation

Generate TypeScript types from the database schema:

```bash
pnpm supabase gen types typescript --local > lib/supabase/database.types.ts
```

### Basic CRUD Operations

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Client = Database['public']['Tables']['clients']['Row']

// SELECT with soft delete filter
const { data: clients } = await supabase
  .from('clients')
  .select('*')
  .is('deleted_at', null)
  .order('name')

// SELECT with relations
const { data: locations } = await supabase
  .from('work_locations')
  .select(`
    *,
    client:clients(*),
    positions(*)
  `)
  .is('deleted_at', null)

// INSERT
const { data: newClient } = await supabase
  .from('clients')
  .insert({ name: 'New Client', email: 'client@example.com' })
  .select()
  .single()

// UPDATE
await supabase
  .from('clients')
  .update({ name: 'Updated Name' })
  .eq('id', clientId)

// SOFT DELETE
await supabase
  .from('clients')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', clientId)
```

### Calling RPC Functions

```typescript
// Check worker availability
const { data: isAvailable } = await supabase.rpc('is_worker_available', {
  p_worker_id: workerId,
  p_check_datetime: new Date().toISOString(),
})

// Get hours report
const { data: report } = await supabase.rpc('get_hours_report', {
  p_start_date: startDate.toISOString(),
  p_end_date: endDate.toISOString(),
  p_client_id: clientId, // optional
})

// End assignment
const { data: assignment } = await supabase.rpc('end_assignment', {
  p_assignment_id: assignmentId,
})

// Cancel assignment
const { data: assignment } = await supabase.rpc('cancel_assignment', {
  p_assignment_id: assignmentId,
})
```

## Migrations

### Create New Migration

```bash
pnpm supabase migration new <migration_name>
```

### Apply Migrations

```bash
pnpm supabase db reset  # Reset and apply all migrations locally
pnpm supabase db push   # Push to remote (use with caution)
```

### Migration File Order

Follow the established pattern:
1. `extensions.sql` - PostgreSQL extensions
2. `enum_types.sql` - Custom ENUM types
3. `tables.sql` - Table definitions
4. `indexes.sql` - Index creation
5. `functions_triggers.sql` - Functions and triggers
6. `rls_policies.sql` - Row Level Security policies

## Row Level Security (RLS)

### Helper Function for Role Check

```sql
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Common Policy Patterns

```sql
-- All authenticated users can read
CREATE POLICY table_select ON table_name
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin-only write access
CREATE POLICY table_admin_insert ON table_name
  FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- User can update own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (
    auth.user_role() = 'admin' OR id = auth.uid()
  );
```

## Additional Resources

### Reference Files

- **`references/schema.md`** - Complete database schema
- **`references/rls-policies.md`** - All RLS policies
- **`references/rpc-functions.md`** - RPC functions reference

### Example Files

- **`examples/server-queries.ts`** - Server Component patterns
- **`examples/auth-actions.ts`** - Authentication server actions

### Scripts

- **`scripts/gen-types.sh`** - Generate TypeScript types

## Common Patterns

### Always Filter Soft Deletes

```typescript
.is('deleted_at', null)
```

### Always Use getUser() for Security

Never trust `getSession()` on the server. Always use `getUser()`:

```typescript
// Correct - validates token with Supabase Auth server
const { data: { user } } = await supabase.auth.getUser()

// Incorrect - can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

### Handle Errors Properly

```typescript
const { data, error } = await supabase.from('table').select()

if (error) {
  console.error('Database error:', error.message)
  throw new Error('Failed to fetch data')
}
```
