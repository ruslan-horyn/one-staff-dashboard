# Analiza Flow Rejestracji i Uwierzytelniania

## Kontekst

Ekspert Next.js/Supabase analizujący flow rejestracji i uwierzytelniania w aplikacji One Staff Dashboard.

Projekt używa:

- Next.js 16 (App Router)
- Supabase Auth (email/password)
- React Hook Form + Zod
- Server Actions z wrapperem `createAction()`

**Kluczowa różnica środowisk:**
- **Lokalnie:** Supabase ma włączone "autoconfirm" - użytkownik jest automatycznie zalogowany po rejestracji
- **Produkcja:** Email confirmation JEST WYMAGANE - użytkownik musi potwierdzić email przed pierwszym logowaniem

Ta różnica powoduje, że kod działa lokalnie, ale na produkcji występują problemy.

## Pliki źródłowe

### Wymagane (przeczytaj wszystkie)

- `app/(auth)/register/_hooks/useSignUpServerAction.ts` - obsługa sukcesu rejestracji
- `app/(auth)/register/_components/RegisterForm.tsx` - formularz rejestracji
- `app/(auth)/login/page.tsx` - strona logowania (cel przekierowania)
- `app/(auth)/login/_components/LoginForm.tsx` - formularz logowania
- `app/auth/callback/route.ts` - obsługa callbacków Supabase (email verification)
- `services/auth/actions.ts` - server actions dla auth
- `services/shared/errors.ts` - kody błędów i mapowanie

### Referencyjne

- `lib/supabase/proxy.ts` - obsługa sesji i przekierowań
- `app/(auth)/forgot-password/page.tsx` - przykład obsługi błędów z URL

## Zadania

### Faza 1: Identyfikacja problemów (kontekst: PRODUKCJA z email confirmation)

Przeanalizuj obecny flow i potwierdź lub zaprzecz istnieniu następujących problemów:

1. **Brak komunikatu po rejestracji (gdy email confirmation wymagane)**
   - Sprawdź co dzieje się po udanej rejestracji w `useSignUpServerAction`
   - Zweryfikuj czy użytkownik otrzymuje informację o konieczności potwierdzenia emaila
   - Na produkcji email confirmation JEST włączone - sprawdź czy kod to obsługuje
   - Sprawdź response z `signUp` - gdy confirmation wymagane, `session` będzie `null`

2. **Brak obsługi potwierdzenia rejestracji**
   - Przeanalizuj `auth/callback/route.ts` dla typu `signup`
   - Sprawdź gdzie użytkownik jest przekierowany po kliknięciu linku weryfikacyjnego
   - Zweryfikuj czy pokazujemy komunikat sukcesu

3. **Brak wyświetlania błędów z URL**
   - Sprawdź czy strona logowania parsuje parametry `error`, `error_code`, `error_description`
   - Przeanalizuj co się dzieje gdy link weryfikacyjny jest nieważny/wygasły
   - Sprawdź obecne przekierowanie błędów w callback route

### Faza 2: Mapowanie flow

Udokumentuj obecne flow dla każdego scenariusza:

**Scenariusz A: Udana rejestracja**

```
1. Użytkownik wypełnia formularz → ?
2. Server action signUp → ?
3. Przekierowanie → ?
4. Co widzi użytkownik → ?
```

**Scenariusz B: Kliknięcie linku weryfikacyjnego (sukces)**

```
1. Użytkownik klika link w emailu → ?
2. Callback route obsługuje → ?
3. Przekierowanie → ?
4. Co widzi użytkownik → ?
```

**Scenariusz C: Kliknięcie linku weryfikacyjnego (błąd - link wygasły/użyty)**

```
1. Użytkownik klika link → ?
2. Callback route obsługuje → ?
3. Przekierowanie → ?
4. Co widzi użytkownik → ?
```

### Faza 3: Dodatkowe problemy

Zidentyfikuj inne potencjalne problemy w flow auth:

- Race conditions
- Brakujące error handling
- UX issues
- Security concerns

## Format wyjścia

### Raport powinien zawierać

```markdown
## Podsumowanie

| Problem | Status | Krytyczność |
|---------|--------|-------------|
| Brak komunikatu po rejestracji | ✅ Potwierdzone / ❌ Nie występuje | Wysoka/Średnia/Niska |
| ... | ... | ... |

## Szczegółowa analiza

### Problem 1: [Nazwa]
**Status:** Potwierdzone/Nie występuje
**Lokalizacja:** `ścieżka/do/pliku.ts:linia`
**Opis:** [Co dokładnie się dzieje]
**Dowód:** [Fragment kodu lub opis zachowania]

### Problem 2: ...

## Flow diagrams

[ASCII lub mermaid diagram obecnego flow]

## Rekomendacje

1. [Konkretna zmiana do wprowadzenia]
2. ...
```

## Kryteria sukcesu

- Każdy zgłoszony problem jest potwierdzony lub odrzucony z dowodem
- Zidentyfikowano minimum 3 dodatkowe potencjalne problemy (jeśli istnieją)
- Wszystkie scenariusze flow są udokumentowane
- Rekomendacje są konkretne i wykonalne

## Ograniczenia

- NIE modyfikuj żadnych plików
- NIE zakładaj zachowania - weryfikuj w kodzie
- NIE ignoruj edge cases
- Raportuj tylko faktyczne problemy potwierdzone w kodzie
