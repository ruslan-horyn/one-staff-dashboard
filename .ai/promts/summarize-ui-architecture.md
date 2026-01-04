Jesteś wykwalifikowanym architektem frontend, którego zadaniem jest stworzenie kompleksowej architektury interfejsu użytkownika w oparciu o dokument wymagań produktu (PRD), plan API i notatki z sesji planowania. Twoim celem jest zaprojektowanie struktury interfejsu użytkownika, która skutecznie spełnia wymagania produktu, jest zgodna z możliwościami API i zawiera spostrzeżenia z sesji planowania.

Najpierw dokładnie przejrzyj następujące dokumenty:

Dokument wymagań produktu (PRD):
<prd>
docs/prd.md
</prd>

Plan API:
<db-plan>
docs/db-plan.md
</db-plan>

server-actions-plan:
<server-actions-plan>
docs/server-actions-plan.md
</server-actions-plan>

directory-architecture:
<directory-architecture>
docs/directory-architecture.md
</directory-architecture>

<conversation_summary>

## Decisions

1. **Nawigacja główna**: Wspólny `(dashboard)/layout.tsx` z dynamiczną nawigacją opartą na roli (Admin vs Coordinator)
2. **Board view**: @tanstack/react-table z compound components pattern, rozwijane wiersze jako Client Component
3. **Responsywność tabeli**: Pełna tabela ze scrollem na wszystkich urządzeniach (bez card layout na mobile)
4. **Server vs Client Components**: Server dla list/layoutu, Client dla formularzy/interaktywności
5. **Zustand**: Minimalnie - tylko stan UI (sidebar, filters, modals), dane biznesowe przez Server Components
6. **Filtrowanie dostępności**: Server Action `getAvailableWorkers(datetime)` z RPC
7. **Formularze**: useFormStatus + useOptimistic z React 19
8. **Eksport raportów**: Server Action z natywnym generowaniem CSV
9. **Modale**: shadcn/ui Dialog (komponenty dodawane osobno)
10. **Obsługa błędów UI**: useActionState z React 19, mapowanie ErrorCodes
11. **shadcn/ui**: Instalacja osobno, komponenty w `/components/ui/`
12. **ARIA/Dostępność**: Wbudowane w @tanstack/react-table
13. **Tailwind CSS 4**: Semantic tokens w globals.css
14. **Ochrona tras**: proxy.ts + sprawdzanie roli w Server Actions
15. **Wyszukiwanie**: URL-based state z debounce 300ms
16. **DateTimePicker**: shadcn Calendar + custom time input
17. **Layout**: CSS Grid z collapsible sidebar, Sheet na mobile
18. **useServerAction hook**: React Query-like API bez `notifications` i `reset`
19. **Implementacja hooka**: useReducer z discriminated union, useRef dla stable options, tryCatch helper
20. **Pytania 21-30**: Odłożone - widoki CRUD w oddzielnych sesjach

## Matched Recommendations

1. **Architektura nawigacji**: Wspólny layout z warunkowym menu na podstawie roli użytkownika
2. **DataTable pattern**: @tanstack/react-table dla sortowania/filtrowania + compound components
3. **State management**: Zustand tylko dla ephemeral UI state, URL jako source of truth dla filters
4. **Server Actions integration**: createAction wrapper + useServerAction hook z callbacks
5. **Error handling**: ActionResult pattern z ErrorCodes mapowanymi na komunikaty
6. **Loading UX**: Wielopoziomowe (page skeleton, form pending, optimistic updates)
7. **Route protection**: proxy.ts + role checking w Server Actions (defense in depth)
8. **Search/Filter**: URL params z debounce dla server-side filtering
9. **useServerAction**: useReducer z discriminated union dla spójnego stanu

## UI Architecture Planning Summary

### Główne wymagania architektoniczne

| Obszar | Decyzja |
|--------|---------|
| UI Library | shadcn/ui (Button, Input, Dialog, Table, Calendar, Sheet, Toast) |
| Tabele | @tanstack/react-table z rozwijalnymi wierszami |
| Formularze | react-hook-form + zod + useServerAction hook |
| State | Zustand minimalistycznie, URL dla shareable state |
| Responsywność | Scrollable tables na wszystkich breakpoints |

### Kluczowe widoki i przepływy

| Widok | Typ | Opis |
|-------|-----|------|
| Login | Server + Client form | Formularz z walidacją |
| Board | Server + Client DataTable | Tabela pracowników z rozwijalnymi przypisaniami |
| Workers/Clients/Locations CRUD | Server pages + Client forms | Do implementacji w osobnych sesjach |
| Reports | Server + Client filters | Filtrowanie + eksport CSV |

### Hook useServerAction - finalna architektura

```typescript
interface UseServerActionOptions<TInput, TData> {
  onSuccess?: (data: TData, variables: TInput) => void | Promise<void>;
  onError?: (error: ActionError, variables: TInput) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: ActionError | undefined, variables: TInput) => void | Promise<void>;
}

interface UseServerActionReturn<TInput, TData> {
  execute: (input: TInput) => Promise<ActionResult<TData>>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: TData | undefined;
  error: ActionError | undefined;
}
```

**Cechy implementacji:**

- `useReducer` z discriminated union state (idle | pending | success | error)
- `useRef` dla stable options (bez re-renderów przy zmianie callbacków)
- `tryCatch` z `/utils/try-catch.ts` dla obsługi błędów sieciowych
- Brak `notifications` i `reset` - uproszczone API

### Bezpieczeństwo

| Warstwa | Implementacja |
|---------|---------------|
| Route protection | proxy.ts sprawdza sesję Supabase |
| Role-based access | Admin-only routes blokowane w proxy |
| Server Actions | Sprawdzanie sesji i roli przez createAction |
| Database | PostgreSQL RLS |

### Struktura plików (nowe)

```
/hooks/
  useServerAction.ts       # hook z useReducer + tryCatch
  useDebounce.ts           # debounce dla filtrów

/lib/notifications/
  error-messages.ts        # ErrorCode → message mapping

/components/layout/
  Sidebar.tsx              # Client - collapsible
  Header.tsx               # Server/Client hybrid

/stores/
  ui.ts                    # sidebarCollapsed
  filters.ts               # workersSearch, dateFilter (opcjonalnie)
```

## Unresolved Issues

1. **i18n/lokalizacja** - strategia dla komunikatów błędów i UI
2. **PWA preparation** - strategia offline/service worker
3. **Error boundaries** - React error boundaries na poziomie route/component
4. **Dark mode** - timeline implementacji
5. **Szczegóły widoków CRUD** (Q21-30) - odłożone do osobnych sesji

</conversation_summary>

Twoim zadaniem jest stworzenie szczegółowej architektury interfejsu użytkownika, która obejmuje niezbędne widoki, mapowanie podróży użytkownika, strukturę nawigacji i kluczowe elementy dla każdego widoku. Projekt powinien uwzględniać doświadczenie użytkownika, dostępność i bezpieczeństwo.

Wykonaj następujące kroki, aby ukończyć zadanie:

1. Dokładnie przeanalizuj PRD, plan API i notatki z sesji.
2. Wyodrębnij i wypisz kluczowe wymagania z PRD.
3. Zidentyfikuj i wymień główne punkty końcowe API i ich cele.
4. Utworzenie listy wszystkich niezbędnych widoków na podstawie PRD, planu API i notatek z sesji.
5. Określenie głównego celu i kluczowych informacji dla każdego widoku.
6. Zaplanuj podróż użytkownika między widokami, w tym podział krok po kroku dla głównego przypadku użycia.
7. Zaprojektuj strukturę nawigacji.
8. Zaproponuj kluczowe elementy interfejsu użytkownika dla każdego widoku, biorąc pod uwagę UX, dostępność i bezpieczeństwo.
9. Rozważ potencjalne przypadki brzegowe lub stany błędów.
10. Upewnij się, że architektura interfejsu użytkownika jest zgodna z planem API.
11. Przejrzenie i zmapowanie wszystkich historyjek użytkownika z PRD do architektury interfejsu użytkownika.
12. Wyraźne mapowanie wymagań na elementy interfejsu użytkownika.
13. Rozważ potencjalne punkty bólu użytkownika i sposób, w jaki interfejs użytkownika je rozwiązuje.

Dla każdego głównego kroku pracuj wewnątrz tagów <ui_architecture_planning> w bloku myślenia, aby rozbić proces myślowy przed przejściem do następnego kroku. Ta sekcja może być dość długa. To w porządku, że ta sekcja może być dość długa.

Przedstaw ostateczną architekturę interfejsu użytkownika w następującym formacie Markdown:

```markdown
# Architektura UI dla [Nazwa produktu]

## 1. Przegląd struktury UI

[Przedstaw ogólny przegląd struktury UI]

## 2. Lista widoków

[Dla każdego widoku podaj:
- Nazwa widoku
- Ścieżka widoku
- Główny cel
- Kluczowe informacje do wyświetlenia
- Kluczowe komponenty widoku
- UX, dostępność i względy bezpieczeństwa]

## 3. Mapa podróży użytkownika

[Opisz przepływ między widokami i kluczowymi interakcjami użytkownika]

## 4. Układ i struktura nawigacji

[Wyjaśnij, w jaki sposób użytkownicy będą poruszać się między widokami]

## 5. Kluczowe komponenty

[Wymień i krótko opisz kluczowe komponenty, które będą używane w wielu widokach].
```

Skup się wyłącznie na architekturze interfejsu użytkownika, podróży użytkownika, nawigacji i kluczowych elementach dla każdego widoku. Nie uwzględniaj szczegółów implementacji, konkretnego projektu wizualnego ani przykładów kodu, chyba że są one kluczowe dla zrozumienia architektury.

Końcowy rezultat powinien składać się wyłącznie z architektury UI w formacie Markdown w języku polskim, którą zapiszesz w pliku .ai/ui-plan.md. Nie powielaj ani nie powtarzaj żadnej pracy wykonanej w bloku myślenia.
