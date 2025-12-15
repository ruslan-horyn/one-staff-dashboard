# Architektura Katalogów - One Staff Dashboard

## Pełne drzewo katalogów

```
one-staff-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupa dla niezalogowanych
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupa dla zalogowanych
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── workers/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── clients/
│   │   ├── locations/
│   │   ├── assignments/
│   │   └── reports/
│   ├── api/                      # Route handlers
│   │   ├── workers/route.ts
│   │   ├── clients/route.ts
│   │   ├── locations/route.ts
│   │   ├── assignments/route.ts
│   │   └── reports/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                       # Bazowe komponenty UI
│   │   └── index.ts
│   ├── layout/                   # Komponenty layoutu
│   │   └── index.ts
│   ├── features/                 # Komponenty domenowe
│   │   ├── workers/index.ts
│   │   ├── clients/index.ts
│   │   ├── locations/index.ts
│   │   ├── assignments/index.ts
│   │   └── reports/index.ts
│   └── forms/                    # Formularze
│       └── index.ts
├── hooks/                        # Custom React hooks
│   └── index.ts
├── stores/                       # Zustand stores
│   └── index.ts
├── types/                        # TypeScript types
│   ├── database.ts               # Typy Supabase (auto-generowane)
│   └── index.ts
├── services/                     # Logika biznesowa
│   └── index.ts
├── utils/                        # Pure utilities
│   └── index.ts
├── lib/                          # Konfiguracje i klienty
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   └── cn.ts
│   └── env.ts
├── __mocks__/                    # Mocks dla testów (MSW handlers)
├── e2e/                          # Playwright E2E testy
├── docs/
│   └── DIRECTORY_ARCHITECTURE.md
├── proxy.ts                      # Next.js 16 proxy (auth guard)
└── ... (config files)
```

## Opis katalogów

### /app - Next.js App Router
Routing i strony aplikacji. Używa grup routingu dla różnych layoutów.
- `(auth)/` - strony dla niezalogowanych (login)
- `(dashboard)/` - strony dla zalogowanych użytkowników
- `api/` - Route handlers (REST API)

### /components - Komponenty React
- `ui/` - Bazowe, reużywalne komponenty UI (Button, Input, Modal, Table)
- `layout/` - Komponenty struktury strony (Header, Sidebar, Footer)
- `features/` - Komponenty domenowe, per funkcjonalność
- `forms/` - Formularze z react-hook-form

### /hooks - Custom React Hooks
Hooki do pobierania danych, zarządzania stanem lokalnym, helpers.

### /stores - Zustand Stores
Globalne store'y dla stanu aplikacji.

### /types - TypeScript Types
Definicje typów. Zawiera auto-generowane typy Supabase (`database.ts`).

### /services - Logika biznesowa
Funkcje do komunikacji z API, logika CRUD.

### /utils - Pure Utilities
Czyste funkcje pomocnicze (formatowanie, walidacja, eksport).

### /lib - Konfiguracje
Klienty zewnętrznych serwisów (Supabase), konfiguracja środowiska.

### Testy jednostkowe (kolokacja)
Pliki `.test.ts` / `.test.tsx` umieszczane **obok testowanego kodu** w tym samym folderze:
- `components/ui/Button.tsx` → `components/ui/Button.test.tsx`
- `hooks/useAuth.ts` → `hooks/useAuth.test.ts`
- `services/workers.service.ts` → `services/workers.service.test.ts`

### /e2e - Testy E2E
Playwright testy end-to-end.

### /__mocks__ - Mocks dla testów
MSW handlers, mock serwisów Supabase.

## Przykłady importów

```typescript
import { Button } from '@/components/ui';
import { WorkerCard } from '@/components/features/workers';
import { useWorkers } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Worker } from '@/types';
import { workersService } from '@/services';
import { formatDate } from '@/utils';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
```

## Checklist: Gdzie umieścić nowy plik?

| Typ pliku | Lokalizacja |
|-----------|-------------|
| Komponent UI (Button, Modal) | `/components/ui/` |
| Komponent layoutu | `/components/layout/` |
| Komponent domenowy | `/components/features/[domena]/` |
| Formularz | `/components/forms/` |
| Custom hook | `/hooks/` |
| Zustand store | `/stores/` |
| Typ TypeScript | `/types/` |
| Serwis API | `/services/` |
| Funkcja utility | `/utils/` |
| API endpoint | `/app/api/[resource]/route.ts` |
| Strona | `/app/(dashboard)/[resource]/page.tsx` |
| Test jednostkowy | Obok pliku: `[plik].test.ts(x)` |
| Test E2E | `/e2e/` |

## Server vs Client Components

- **Domyślnie Server Components** (bez `'use client'`)
- **Client Components** tylko gdy potrzebne:
  - Interaktywność (onClick, onChange)
  - React hooks (useState, useEffect)
  - Browser API (window, localStorage)
- Granica client/server oznaczona w strukturze komponentów

## Konwencje nazewnictwa

| Typ | Konwencja | Przykład |
|-----|-----------|----------|
| Komponenty | PascalCase | `WorkerCard.tsx` |
| Hooki | camelCase + `use` prefix | `useWorkers.ts` |
| Utils/lib | camelCase | `formatDate.ts` |
| Typy | PascalCase | `worker.ts` |
| Serwisy | camelCase + `.service` suffix | `workers.service.ts` |
| Testy | `.test.ts` lub `.test.tsx` | `Button.test.tsx` |

## Aktualizacja typów Supabase

Po zmianach w schemacie bazy danych, wygeneruj nowe typy:

```bash
pnpm supabase gen types typescript --local > types/database.ts
```
