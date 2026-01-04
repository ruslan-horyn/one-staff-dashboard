# Planowanie architektury UI dla One Staff Dashboard

Jesteś asystentem AI, którego zadaniem jest pomoc w zaplanowaniu architektury interfejsu uzytkownika dla MVP (Minimum Viable Product) na podstawie dostarczonych informacji. Twoim celem jest wygenerowanie listy pytan i zalecen, ktore zostana wykorzystane w kolejnym promptowaniu do utworzenia szczegolowej architektury UI, map podrozy uzytkownika i struktury nawigacji.

Prosimy o uwazne zapoznanie sie z ponizszymi informacjami:

<product_requirements>
@prd.md
</product_requirements>

<tech_stack>
@tech-stack.md
</tech_stack>

<database_schema>
@db-plan.md
</database_schema>

<directory_architecture>
@directory-architecture.md
</directory_architecture>

## Kontekst projektu

One Staff Dashboard to wewnetrzna aplikacja webowa dla agencji pracy tymczasowej. Glowne cechy:

- **Uzytkownicy**: Administrator i Koordynator (Pracownik Agencji)
- **Glowne encje**: Klienci, Miejsca Pracy, Pracownicy Tymczasowi, Stanowiska, Przypisania
- **Kluczowy workflow**: Przypisywanie pracownikow do stanowisk z datami rozpoczecia/zakonczenia
- **Raportowanie**: Raporty przepracowanych godzin z eksportem CSV/Excel

## Tech Stack

- Next.js 16 (App Router) z Server Components
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth z JWT)
- Zustand (state management)
- react-hook-form + Zod (formularze)
- Biome (linting/formatting)

## Wytyczne analizy

Przeanalizuj dostarczone informacje, koncentrujac sie na aspektach istotnych dla projektowania interfejsu uzytkownika. Rozwaz nastepujace kwestie:

1. Zidentyfikuj kluczowe widoki i ekrany na podstawie wymagan produktu i schematu bazy danych
2. Okresl potencjalne przeplywy uzytkownika i nawigacje miedzy widokami
3. Rozwaz komponenty UI i wzorce interakcji wymagane dla glownego widoku "Board" (tabela pracownikow z rozwijalnymi wierszami)
4. Pomysl o responsywnosci (RWD) jako fundamencie dla przyszlej PWA
5. Ocen wymagania bezpieczenstwa - role (admin/coordinator) i polityki RLS
6. Przeanalizuj strukture katalogow `/components/features/` i `/services/` dla organizacji kodu
7. Rozwaz integracje z Server Actions i React Server Components

## Format wyjscia

Na podstawie analizy wygeneruj liste 10 pytan i zalecen w formie laczonej (pytanie + zalecenie). Powinny one dotyczyc wszelkich niejasnosci, potencjalnych problemow lub obszarow wymagajacych wiecej informacji.

<pytania>
Tutaj wymien pytania i zalecenia, dla przejrzystosci opatrzone numerami:

1. [Pytanie dotyczace konkretnego aspektu UI]

   **Rekomendacja:** [Konkretna rekomendacja oparta na tech stacku i wymaganiach]
</pytania>

## Obszary do rozpatrzenia

1. Hierarchia i organizacja widokow w Next.js App Router (route groups: `(auth)/`, `(dashboard)/`)
2. Przeplywy uzytkownika dla rol admin vs coordinator
3. Responsywnosc tabeli "Board" na urzadzeniach mobilnych
4. Dostepnosc (ARIA landmarks, keyboard navigation)
5. Zarzadzanie stanem - kiedy Server Components vs Zustand
6. Obsluga stanow bledow z ActionResult<T> pattern
7. Strategia buforowania i rewalidacji danych
8. Integracja formularzy z react-hook-form i Server Actions
9. Komponenty UI dla specyficznych wzorcow (rozwijane wiersze tabeli, modale, filtry)
10. Strategia eksportu raportow (CSV/Excel) - client vs server-side

## Instrukcje

- Kontynuuj ten proces, generujac nowe pytania i rekomendacje w oparciu o przekazany kontekst i odpowiedzi uzytkownika, dopoki uzytkownik wyraznie nie poprosi o podsumowanie
- Skupiaj sie na jasnosci, trafnosci i dokladnosci wynikow
- Nie dolaczaj zadnych dodatkowych komentarzy ani wyjasnien poza okreslonym formatem wyjsciowym
