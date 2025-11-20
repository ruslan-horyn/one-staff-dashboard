# One Staff Dashboard  - Tech Stack

### Frontend - Next.js z React dla komponentów interaktywnych

- Next.js 16 (app router) z nastawieniem na routing server-side
- React 19 dla interaktywnych komponentów
- TypeScript 5 dla lepszej jakości kodu i wsparcia IDE
- Tailwind CSS 4 dla szybkiego stylowania
- Zustand dla zarządzania stanem aplikacji
- Lucide React (ikony aplikacji)

### Backend - Next z Supabase jako kompleksowe rozwiązanie backendowe

- Wbudowana autentykacja użytkowników oparta o JWT i Supabase Auth
- Baza danych PostgreSQL w oparciu o Supabase

### CI/CD i Hosting

- Github Actions do tworzenia pipeline'ów CI/CD
- Cloudflare Pages do hostingu - workflow `master.yml`

### Testing

- Testy jednostkowe - Vitest z React Testing Library dla komponentów UI:

  - Vitest jako nowoczesny i szybki runner testów zoptymalizowany dla Vite/Next
  - React Testing Library do testowania interaktywnych komponentów React
  - @testing-library/dom do testowania statycznych komponentów Next
  - MSW (Mock Service Worker) do mockowania API w testach

- Testy end-to-end - Playwright:

  - Symulacja pełnych ścieżek użytkownika z lepszą wieloprzeglądarkowością
  - Testowanie kluczowych funkcjonalności: kreator reguł, generowanie reguł na podstawie plików, zarządzanie kolekcjami
  - Automatyczne uruchamianie testów w ramach pipeline CI/CD GitHub Actions

- Formatowanie i lintowanie kodu

  - ESLint dla lintowania kodu
  - Prettier dla formatowania kodu

- Zależności: `package.json`
