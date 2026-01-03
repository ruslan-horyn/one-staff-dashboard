# Konfiguracja Vitest z Coverage i MSW

## Kontekst

Doświadczony TypeScript developer konfigurujący środowisko testowe dla projektu Next.js 16.
Projekt używa:

- Next.js 16 (App Router, Server Components, Server Actions)
- React 19
- TypeScript 5
- Supabase (PostgreSQL + Auth)
- pnpm jako package manager
- Biome do lintingu i formatowania

Cel: Skonfigurować Vitest z 90% wymaganym pokryciem kodu dla nowego kodu, obsługą React Testing Library dla komponentów oraz MSW do mockowania API.

## Pliki źródłowe

### Primary (must read):

- `package.json` - aktualne zależności i skrypty
- `tsconfig.json` - konfiguracja TypeScript i aliasy ścieżek
- `docs/directory-architecture.md` - struktura projektu i konwencje testów

### Reference (read as needed):

- `services/shared/action-wrapper.ts` - wrapper dla server actions
- `lib/supabase/server.ts` - klient Supabase do mockowania
- `CLAUDE.md` - konwencje projektu i wytyczne testowania

## Zadania

### Faza 1: Instalacja zależności

Zainstaluj wymagane pakiety:

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event vite-tsconfig-paths msw @vitest/coverage-v8
```

**Pakiety:**

| Pakiet | Cel |
|--------|-----|
| `vitest` | Test runner |
| `@vitejs/plugin-react` | Obsługa JSX/React |
| `jsdom` | Środowisko DOM dla testów komponentów |
| `@testing-library/react` | Narzędzia do testowania komponentów React |
| `@testing-library/dom` | Podstawowe narzędzia Testing Library |
| `@testing-library/user-event` | Symulacja interakcji użytkownika |
| `vite-tsconfig-paths` | Obsługa aliasów `@/*` z tsconfig |
| `msw` | Mock Service Worker do mockowania API |
| `@vitest/coverage-v8` | Provider coverage (szybszy niż istanbul) |

### Faza 2: Konfiguracja Vitest

Utwórz plik `vitest.config.mts` w katalogu głównym:

```typescript
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Środowisko
    environment: 'jsdom',
    globals: true,

    // Pliki setup
    setupFiles: ['./vitest.setup.ts'],

    // Wzorce plików testowych (kolokacja + __tests__ folders)
    include: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/__tests__/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'e2e/**',
    ],

    // Coverage
    coverage: {
      provider: 'v8',
      enabled: false, // Włączane przez CLI: --coverage
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Progi pokrycia - 90% dla nowego kodu
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },

      // Pliki do analizy coverage
      include: [
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/index.ts',
        '**/*.d.ts',
        'types/**',
        'lib/**',
        '__mocks__/**',
      ],
    },

    // Timeout dla testów async
    testTimeout: 10000,

    // Izolacja testów
    isolate: true,
    restoreMocks: true,
  },
});
```

### Faza 3: Plik setup

Utwórz plik `vitest.setup.ts` w katalogu głównym:

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './__mocks__/server';

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// MSW Server setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

Dodaj pakiet `@testing-library/jest-dom`:

```bash
pnpm add -D @testing-library/jest-dom
```

### Faza 4: Konfiguracja MSW

Utwórz strukturę katalogów dla mocków:

```
__mocks__/
├── handlers/
│   ├── auth.ts       # Handlery dla auth API
│   ├── workers.ts    # Handlery dla workers API
│   └── index.ts      # Eksport wszystkich handlerów
├── server.ts         # Konfiguracja serwera MSW
└── supabase.ts       # Mock klienta Supabase
```

**Plik `__mocks__/handlers/index.ts`:**

```typescript
import { authHandlers } from './auth';
// Dodawaj kolejne handlery w miarę potrzeb
// import { workersHandlers } from './workers';

export const handlers = [
  ...authHandlers,
  // ...workersHandlers,
];
```

**Plik `__mocks__/handlers/auth.ts`:**

```typescript
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Przykładowy handler - dostosuj do swojego API
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'user-123', email: 'test@example.com' },
    });
  }),
];
```

**Plik `__mocks__/server.ts`:**

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Plik `__mocks__/supabase.ts`:**

```typescript
import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

export const createMockSupabaseClient = () => mockSupabaseClient;
```

### Faza 5: Skrypty npm

Zaktualizuj `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### Faza 6: Konfiguracja TypeScript

Dodaj typy Vitest do `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

Lub utwórz osobny `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "vitest.setup.ts",
    "__mocks__/**/*"
  ]
}
```

### Faza 7: Weryfikacja

1. Uruchom testy:
   ```bash
   pnpm test:run
   ```

2. Sprawdź coverage:
   ```bash
   pnpm test:coverage
   ```

3. Otwórz raport HTML:
   ```bash
   open coverage/index.html
   ```

## Format wyjściowy

### Struktura plików po konfiguracji

```
project-root/
├── vitest.config.mts          # Konfiguracja Vitest
├── vitest.setup.ts            # Setup file (MSW, cleanup)
├── __mocks__/
│   ├── handlers/
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── server.ts
│   └── supabase.ts
├── coverage/                   # Generowane raporty
│   ├── index.html
│   └── lcov.info
└── package.json               # Zaktualizowane skrypty
```

### Przykładowa struktura testu (dla referencji)

**Preferowana struktura: `__tests__/` subfolder w każdym module:**

```
services/shared/
├── __tests__/
│   └── result.test.ts
├── result.ts
├── errors.ts
└── index.ts

components/ui/
├── __tests__/
│   └── Button.test.tsx
├── Button.tsx
└── index.ts
```

```typescript
// components/ui/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

```typescript
// services/auth/__tests__/actions.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isFailure, isSuccess } from '@/services/shared';
import { ErrorCodes } from '@/services/shared/errors';
import { signIn } from '../actions';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success with valid credentials', async () => {
    // Setup mock...
    const result = await signIn({ email: 'test@example.com', password: 'password123' });
    expect(isSuccess(result)).toBe(true);
  });

  it('returns validation error with invalid email', async () => {
    const result = await signIn({ email: 'invalid', password: 'password123' });
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });
});
```

## Ograniczenia

- NIE dodawaj przykładowych testów - tylko konfiguracja
- NIE modyfikuj istniejącego kodu produkcyjnego
- Używaj `vi.mock()` dla mockowania modułów (nie `jest.mock()`)
- Używaj `vi.fn()` dla funkcji mock (nie `jest.fn()`)
- Pliki testowe umieszczaj w `__tests__/` subfolderze modułu (preferowane) lub obok kodu (kolokacja)
- Nazwy plików: `*.test.ts` lub `*.test.tsx`
- Zachowaj konwencje importów projektu (Biome order)
- Testy E2E pozostają w katalogu `e2e/` (Playwright)

## Dodatkowe uwagi

### Testowanie Server Components

Vitest nie wspiera async Server Components. Dla nich używaj:
- Testów jednostkowych dla synchronicznej logiki
- Testów E2E (Playwright) dla pełnej funkcjonalności

### Testowanie Server Actions

1. Mockuj `@/lib/supabase/server` createClient
2. Używaj `isSuccess` i `isFailure` z `@/services/shared`
3. Sprawdzaj error codes z `ErrorCodes`

### Coverage dla nowego kodu

Aby sprawdzić coverage tylko dla zmienionych plików:
```bash
pnpm test:coverage -- --changed
```

Lub skonfiguruj w CI z `--changedSince=main`.
