# Analiza Złożoności Komponentów i Rekomendacje Refaktoryzacji

## Context

Expert frontend developer specjalizujący się w React 19, Next.js 16 (App Router) i TypeScript 5.
Projekt wykorzystuje:
- React 19 z functional components i hooks
- Next.js 16 z App Router i Server Components
- TypeScript 5 ze strict mode
- Tailwind CSS 4 do stylowania
- Zustand do zarządzania stanem
- react-hook-form + Zod do formularzy
- Vitest + React Testing Library do testów

## Source Files

### Primary (must read):
- Wszystkie pliki `*.tsx` i `*.ts` w folderze `components/` i jego podfolderach

### Reference (read as needed):
- `docs/tech-stack.md` - stack technologiczny projektu
- `docs/directory-architecture.md` - architektura katalogów

## Tasks

### Phase 1: Identyfikacja plików o wysokiej złożoności

1. Przeskanuj rekurencyjnie folder `components/` identyfikując wszystkie pliki `.tsx` i `.ts`
2. Dla każdego pliku oblicz liczbę linii kodu (LOC)
3. Posortuj pliki malejąco według LOC
4. Wyselekcjonuj TOP 5 plików o największej liczbie LOC

### Phase 2: Analiza każdego pliku z TOP 5

Dla każdego z 5 plików wykonaj:

1. **Przeczytaj pełną zawartość pliku**
2. **Zidentyfikuj problemy złożoności:**
   - Nadmierna liczba responsibilities (Single Responsibility Principle)
   - Duża liczba useState/useEffect hooks
   - Zagnieżdżone warunki renderowania
   - Powtarzający się kod (DRY violations)
   - Brak separacji logiki od prezentacji
   - Zbyt długie funkcje (>50 LOC)
   - Props drilling
   - Brak memoizacji dla kosztownych operacji

3. **Dopasuj rekomendacje do technologii projektu:**
   - React 19: Server Components, use hook, useOptimistic, useTransition
   - Custom hooks dla reużywalnej logiki
   - Zustand dla współdzielonego stanu (zamiast props drilling)
   - Compound Components pattern dla złożonych UI
   - Render Props lub Higher-Order Components gdzie zasadne
   - Code splitting z React.lazy i Suspense

### Phase 3: Sformułowanie rekomendacji

Dla każdego pliku przygotuj:
1. Konkretne wzorce do zastosowania
2. Techniki refaktoryzacji krok po kroku
3. Argumentację biznesową (maintainability, testability, performance)

## Output Format

### Sekcja 1: TOP 5 Plików według LOC

```markdown
| # | Ścieżka pliku | LOC | Potencjalna złożoność |
|---|---------------|-----|----------------------|
| 1 | components/features/example.tsx | 450 | Wysoka - wiele responsibilities |
| 2 | ... | ... | ... |
```

### Sekcja 2: Szczegółowa analiza każdego pliku

```markdown
## 1. `components/features/example.tsx` (450 LOC)

### Zidentyfikowane problemy
- [Problem 1]: Opis problemu
- [Problem 2]: Opis problemu

### Rekomendacje refaktoryzacji

#### A) [Nazwa wzorca/techniki]
**Argumentacja:** Dlaczego to pomoże
**Implementacja:**
- Krok 1
- Krok 2
- Krok 3

#### B) [Nazwa wzorca/techniki]
...
```

## Success Criteria

### Measurable Goals
- [ ] Zidentyfikowano dokładnie 5 plików o największej liczbie LOC
- [ ] Każdy plik ma minimum 2 konkretne rekomendacje refaktoryzacji
- [ ] Rekomendacje są dopasowane do stack technologicznego (React 19, Next.js 16, TypeScript 5)
- [ ] Każda rekomendacja zawiera argumentację i kroki implementacji

### Validation Method
- Weryfikacja czy wszystkie ścieżki plików istnieją
- Sprawdzenie czy rekomendacje wykorzystują nowoczesne API (React 19 hooks, Server Components)
- Ocena czy argumentacja odnosi się do maintainability, testability lub performance

## Constraints

- DO NOT sugeruj migracji na inne frameworki lub biblioteki spoza tech-stack
- DO NOT rekomenduj class components - tylko functional components z hooks
- ONLY sugeruj wzorce kompatybilne z React 19 i Next.js 16 App Router
- Preferuj Server Components gdzie możliwe (zgodnie z Next.js best practices)
- Zachowuj zgodność z istniejącymi konwencjami projektu z CLAUDE.md

## Examples

### Przykład rekomendacji dla dużego formularza

**Problem:** Komponent formularza z 300 LOC zawiera logikę walidacji, API calls i UI w jednym pliku.

**Rekomendacja: Custom Hook + Separation of Concerns**

**Argumentacja:** Wydzielenie logiki formularza do custom hook (`useWorkerForm`) zwiększy testowalność (można testować hook niezależnie od UI) i reużywalność (hook można użyć w innych widokach).

**Implementacja:**
1. Wydziel logikę do `hooks/useWorkerForm.ts`:
   ```typescript
   export const useWorkerForm = (defaultValues: WorkerInput) => {
     const form = useForm<WorkerInput>({
       resolver: zodResolver(workerSchema),
       defaultValues,
     });
     // mutation logic, handlers
     return { form, onSubmit, isSubmitting };
   };
   ```
2. Uprość komponent do czystej prezentacji
3. Dodaj testy jednostkowe dla hooka

### Przykład rekomendacji dla komponentu z props drilling

**Problem:** Komponent przekazuje 5+ props przez 3 poziomy zagnieżdżenia.

**Rekomendacja: Zustand Store lub React Context**

**Argumentacja:** Eliminacja props drilling uprości interfejsy komponentów i ułatwi dodawanie nowych features bez modyfikacji pośrednich komponentów.

**Implementacja:**
1. Stwórz Zustand store w `stores/featureStore.ts`
2. Zastąp props drilling hookiem `useFeatureStore()`
3. Usuń niepotrzebne props z komponentów pośrednich
