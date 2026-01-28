# Docker Setup

Run the application in Docker containers with Supabase CLI for local database.

## Prerequisites

- Docker Desktop
- Supabase CLI (`pnpm add -g supabase`)

## Quick Start

### 1. Start Supabase

```bash
supabase start
```

Copy `anon key` and `service_role key` from the output.

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste the keys from `supabase status`:

```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Docker compose files use `env_file: .env.local` to load variables automatically and override `NEXT_PUBLIC_SUPABASE_URL` to `host.docker.internal:54321` for container networking.

### 3. Run Application

**Development (with hot reload):**

```bash
pnpm docker:dev
```

**Production build:**

```bash
pnpm docker:prod
```

**E2E tests:**

```bash
pnpm docker:e2e
```

### 4. Stop Services

```bash
pnpm docker:down
supabase stop
```

## Service URLs

| Service | URL |
|---------|-----|
| App (dev) | http://localhost:3100 |
| App (prod) | http://localhost:3101 |
| App (e2e) | http://localhost:3102 |
| Supabase API | http://localhost:54321 |
| Supabase DB | localhost:54322 |
| Supabase Studio | http://localhost:54323 |
| Inbucket (email) | http://localhost:54324 |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm docker:dev` | Start dev container with hot reload |
| `pnpm docker:dev:build` | Rebuild and start dev container |
| `pnpm docker:prod` | Build and run production image |
| `pnpm docker:e2e` | Run E2E tests in containers |
| `pnpm docker:down` | Stop all containers |
| `pnpm docker:logs` | View app container logs |
| `pnpm docker:shell` | Open shell in app container |

## Health Check

The application exposes a health endpoint at `/api/health`:

```bash
curl http://localhost:3100/api/health
# {"status":"ok","timestamp":"2024-01-28T19:30:00.000Z"}
```

Production containers use this endpoint for Docker health checks.

## Troubleshooting

### Container can't connect to Supabase

Ensure Supabase CLI is running:

```bash
supabase status
```

### Port 3100 already in use

Stop any existing containers or processes using the port:

```bash
pnpm docker:down
lsof -i :3100
```

### Build failures

Clean Docker cache and rebuild:

```bash
docker compose down -v
docker builder prune
pnpm docker:dev:build
```

### View container logs

```bash
pnpm docker:logs
```
