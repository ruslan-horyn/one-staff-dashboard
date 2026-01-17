# Analiza Responsywności i Jakości UI

## Context

Ekspert UX/UI z doświadczeniem w ocenie interfejsów webowych pod kątem responsywności, dostępności i spójności wizualnej. Zadanie polega na wizualnej analizie aplikacji One Staff Dashboard - wewnętrznego narzędzia dla agencji pracy tymczasowej.

Aplikacja wykorzystuje:

- Next.js 16 z App Router
- Tailwind CSS 4 z systemem design tokens
- shadcn/ui jako bazę komponentów
- Breakpointy: mobile (<768px), tablet (768-1023px), desktop (≥1024px)

## Arguments

Prompt przyjmuje opcjonalne argumenty:

| Argument | Opis | Przykład |
|----------|------|----------|
| `views` | Lista widoków do audytu (domyślnie: wszystkie) | `login`, `login,register` |
| `breakpoints` | Breakpointy do testowania (domyślnie: wszystkie) | `mobile`, `mobile,desktop` |

<examples>
# Audyt tylko strony logowania:
"Execute UI audit for login page"

# Audyt wielu widoków

"Execute UI audit for login, register, forgot-password"

# Audyt tylko mobile

"Execute UI audit for login page, mobile only"
</examples>

## Wymagania Wstępne

### Narzędzia

Użyj Playwright MCP do przechwycenia widoków w różnych rozdzielczościach.

**Przed rozpoczęciem:**

1. Sprawdź czy aplikacja działa (`pnpm dev`)
2. Jeśli nie działa, uruchom ją w tle

### Rozdzielczości do testowania

| Breakpoint | Szerokość | Wysokość | Reprezentuje |
|------------|-----------|----------|--------------|
| Mobile     | 375px     | 812px    | iPhone 13 Mini |
| Tablet     | 768px     | 1024px   | iPad Portrait |
| Desktop    | 1440px    | 900px    | Laptop 14" |

### Dostępne widoki

| Ścieżka | Opis | Wymaga auth |
|---------|------|-------------|
| `/login` | Formularz logowania | Nie |
| `/register` | Formularz rejestracji | Nie |
| `/forgot-password` | Reset hasła | Nie |
| `/` | Główny widok (/dashboard) | Tak |
| `/workers` | Lista pracowników | Tak |

## Tasks

### Phase 1: Przechwycenie Widoków

Dla każdego widoku z listy argumentów (lub wszystkich jeśli nie podano):

1. **Zmień rozmiar okna** na wymaganą rozdzielczość
2. **Nawiguj do widoku** i poczekaj na załadowanie (2s)
3. **Wykonaj screenshot** całej strony (fullPage: true)
4. **Zapisz screenshot** - Playwright MCP zapisuje do `.playwright-mcp/screenshots/`

### Phase 2: Analiza Wizualna

Po przechwyceniu screenshotów, przeanalizuj każdy widok pod kątem:

#### 2.1 Responsywność Layoutu

<evaluation_criteria>

| Kryterium | Opis | Waga |
|-----------|------|------|
| Dopasowanie do szerokości | Brak poziomego scrolla | Krytyczne |
| Hierarchia treści | Logiczna kolejność na mobile | Wysoka |
| Dotykowe cele | Przyciski ≥44x44px na mobile | Wysoka |
| Odstępy | Proporcjonalne marginesy i paddingi | Średnia |
| Breakpoint transitions | Płynne przejścia między rozdzielczościami | Średnia |
</evaluation_criteria>

#### 2.2 Spójność Wizualna

<visual_consistency_checks>

- Czy kolory są spójne między widokami?
- Czy typografia zachowuje hierarchię?
- Czy spacing jest konsekwentny?
- Czy komponenty mają jednolity styl?
- Czy ikony są czytelne w każdej rozdzielczości?
</visual_consistency_checks>

#### 2.3 Użyteczność Formularzy

<form_usability_checks>

- Czy pola formularzy są wystarczająco duże na mobile?
- Czy etykiety są widoczne i czytelne?
- Czy komunikaty błędów są widoczne?
- Czy przycisk submit jest łatwo dostępny?
- Czy keyboard navigation jest logiczna?
</form_usability_checks>

### Phase 3: Raport z Oceną

Wygeneruj szczegółowy raport w formacie:

## Output Format

### Struktura Raportu

```markdown
# UI Responsiveness Audit Report

## Executive Summary
[1-2 zdania podsumowujące ogólną ocenę]

## Ocena Ogólna: [X/10]

## Szczegółowa Analiza

### [Nazwa Widoku]

#### Mobile (375px)
**Screenshot**: [ścieżka do pliku]
**Ocena**: [X/10]

**Mocne strony**:
- [punkt 1]
- [punkt 2]

**Problemy**:
| Problem | Ważność | Sugestia naprawy |
|---------|---------|------------------|
| [opis]  | [Krytyczna/Wysoka/Średnia/Niska] | [sugestia] |

#### Tablet (768px)
[...analogicznie...]

#### Desktop (1440px)
[...analogicznie...]

---

### Podsumowanie Problemów

#### Krytyczne (do natychmiastowej naprawy)
1. [problem + lokalizacja]

#### Wysokie (do naprawy przed release)
1. [problem + lokalizacja]

#### Średnie (backlog)
1. [problem + lokalizacja]

### Rekomendacje Ogólne
1. [rekomendacja 1]
2. [rekomendacja 2]

## Ocena Kryteriów Responsywności

| Kryterium | Ocena | Uwagi |
|-----------|-------|-------|
| Dopasowanie do szerokości | ✅/⚠️/❌ | [uwaga] |
| Hierarchia treści | ✅/⚠️/❌ | [uwaga] |
| Dotykowe cele | ✅/⚠️/❌ | [uwaga] |
| Odstępy | ✅/⚠️/❌ | [uwaga] |
| Breakpoint transitions | ✅/⚠️/❌ | [uwaga] |

## Screenshoty

[Lista ścieżek do wszystkich screenshotów]

---
*Raport wygenerowany: [data]*
*Narzędzie: Playwright MCP + Claude Code*
```

### Przykład Oceny Pojedynczego Elementu

```markdown
#### Formularz Logowania - Mobile

**Screenshot**: screenshots/login-mobile.png

**Ocena układu**: 8/10
- ✅ Formularz mieści się w viewport
- ✅ Pola mają odpowiednią wysokość (44px)
- ⚠️ Logo mogłoby być mniejsze, zajmuje 30% ekranu
- ❌ Brak widocznego linku "Zapomniałem hasła" bez scrollowania

**Problemy znalezione**:
| Problem | Ważność | Lokalizacja | Sugestia |
|---------|---------|-------------|----------|
| Link "Forgot password" poniżej fold | Średnia | login-mobile.png:L450 | Przenieś nad przycisk |
| Brak autofocus na polu email | Niska | Input#email | Dodaj autoFocus |
```

## Success Criteria

### Measurable Goals

- [ ] Przechwycono screenshoty wszystkich widoków w 3 rozdzielczościach
- [ ] Każdy widok oceniony w skali 1-10 z uzasadnieniem
- [ ] Zidentyfikowano wszystkie problemy krytyczne (blokujące użytkowanie)
- [ ] Każdy problem ma przypisaną ważność i sugestię naprawy
- [ ] Raport zawiera konkretne referencje do screenshotów

### Validation Method

1. Sprawdź czy screenshoty zostały zapisane w czytelnej jakości
2. Zweryfikuj czy oceny są spójne (podobne problemy = podobna ocena)
3. Potwierdź że sugestie naprawy są wykonalne technicznie

## Constraints

- NIE modyfikuj żadnego kodu - to jest tylko audyt
- NIE zakładaj jak wygląda interfejs - bazuj TYLKO na screenshotach
- ZAWSZE podawaj konkretne lokalizacje problemów (plik lub obszar screenshota)
- Oceniaj TYLKO to co widzisz, nie spekuluj o ukrytych elementach
- Używaj POLSKIEGO języka w raporcie (nazwy techniczne mogą być po angielsku)
- Screenshoty są zapisywane przez Playwright MCP do `.playwright-mcp/screenshots/`
- IGNORUJ elementy dev-only (Next.js Dev Tools button, HMR indicators) - nie są problemami
- Po zakończeniu audytu ZAPISZ raport do `screenshots/{widok}-audit-report.md`

## Execution Commands

### Playwright MCP Tools

| Narzędzie | Użycie |
|-----------|--------|
| `browser_resize` | Zmiana rozdzielczości viewportu |
| `browser_navigate` | Nawigacja do URL |
| `browser_wait_for` | Oczekiwanie na załadowanie |
| `browser_take_screenshot` | Przechwycenie screenshota |
| `browser_snapshot` | Accessibility tree (opcjonalnie) |

### Sekwencja dla każdego widoku

```
1. browser_resize(width, height)
2. browser_navigate("http://localhost:3000/{path}")
3. browser_wait_for(time: 2)
4. browser_take_screenshot(filename: "{view}-{breakpoint}.png", fullPage: true)
```

### Przykład pełnego audytu login

```
# Mobile
browser_resize(375, 812)
browser_navigate("http://localhost:3000/login")
browser_wait_for(time: 2)
browser_take_screenshot("login-mobile.png", fullPage: true)

# Tablet
browser_resize(768, 1024)
browser_wait_for(time: 1)
browser_take_screenshot("login-tablet.png", fullPage: true)

# Desktop
browser_resize(1440, 900)
browser_wait_for(time: 1)
browser_take_screenshot("login-desktop.png", fullPage: true)
```

## Notes

### Elementy do ignorowania

Na screenshotach mogą pojawić się elementy dev-only:

- **Next.js Dev Tools button** (czarny przycisk w lewym dolnym rogu) - ignoruj
- **HMR/Fast Refresh indicators** - ignoruj
- **React DevTools prompts** - ignoruj

Te elementy nie są widoczne w produkcji i nie stanowią problemów UI.

### Ograniczenia Modeli Wizualnych

Podczas oceny pamiętaj o znanych ograniczeniach:

- Modele mogą mieć trudności z oceną subtelnych różnic kolorów
- Małe elementy (<10px) mogą być trudne do identyfikacji
- Animacje i przejścia nie są widoczne na screenshotach
- Interaktywne stany (hover, focus) wymagają osobnych screenshotów

### Dodatkowe Testy (opcjonalne)

Jeśli czas pozwala, rozważ również:

- Test dark mode (jeśli zaimplementowany)
- Test stanów interaktywnych (error states, loading states)
- Test z różnymi długościami tekstu
- Test z wyłączonym CSS (accessibility baseline)
