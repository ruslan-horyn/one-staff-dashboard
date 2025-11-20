# Dokument wymagań produktu (PRD) - One Staff Dashboard

## 1. Przegląd produktu

One Staff Dashboard to wewnętrzna aplikacja internetowa (panel) w wersji MVP (Minimum Viable Product), zaprojektowana w celu usprawnienia podstawowych operacji w agencji pracy tymczasowej. Celem produktu jest zastąpienie istniejących, manualnych procesów opartych na arkuszach kalkulacyjnych, centralizując zarządzanie danymi pracowników tymczasowych, klientów, miejsc pracy oraz grafików. Panel umożliwi koordynatorom szybkie przypisywanie pracowników do otwartych stanowisk, monitorowanie ich obłożenia oraz generowanie kluczowych raportów dotyczących przepracowanych godzin. Architektura RWD (Responsive Web Design) zapewni fundament pod przyszły rozwój, w tym potencjalną aplikację PWA (Progressive Web App).

## 2. Problem użytkownika

Obecnie koordynatorzy i administratorzy w agencji polegają na rozproszonych arkuszach kalkulacyjnych i manualnej komunikacji do zarządzania harmonogramami pracowników, ich dostępnością i danymi klientów. Taki system jest nieefektywny, podatny na błędy i nie skaluje się wraz ze wzrostem liczby pracowników i zleceń. Główne problemy do rozwiązania to:

* Brak centralnego źródła prawdy o danych pracowników i ich statusie (dostępny, przypisany).
* Duży nakład czasu i ryzyko pomyłek przy ręcznym tworzeniu i aktualizowaniu grafików.
* Trudności w szybkim znajdowaniu dostępnych pracowników pasujących do otwartego zapotrzebowania.
* Czasochłonne i ręczne generowanie raportów przepracowanych godzin na potrzeby list płac i fakturowania klientów.
* Brak transparentności i historii zmian, co utrudnia weryfikację rozliczeń i audyt.

Użytkownicy potrzebują jednego, zintegrowanego narzędzia, które zautomatyzuje i uprości te procesy, pozwalając im skupić się na efektywnym dopasowywaniu pracowników do potrzeb klientów.

## 3. Wymagania funkcjonalne

### 3.1. Zarządzanie użytkownikami i dostępem

* System oparty na dwóch rolach: `Administrator` i `Pracownik Agencji (Koordynator)`.
* Administrator zarządza kontami Koordynatorów.
* Logowanie do systemu odbywa się za pomocą loginu i hasła.

### 3.2. Zarządzanie danymi podstawowymi

* CRUD (Create, Read, Update, Delete) dla Klientów (zarządzany przez Administratora).
* CRUD dla Miejsc Pracy, powiązanych z Klientami (zarządzany przez Administratora).
* CRUD dla Pracowników Tymczasowych z polami: Imię, Nazwisko, Numer telefonu.
* Możliwość tworzenia "Otwartych Stanowisk" w kontekście Miejsca Pracy.

### 3.3. Główny przepływ pracy: Zarządzanie przypisaniami

* Możliwość przypisania pracownika do stanowiska z określoną datą i godziną rozpoczęcia oraz opcjonalną datą/godziną zakończenia.
* System świadomie zezwala na tworzenie nakładających się czasowo przypisań dla jednego pracownika.
* Funkcja "Zakończ pracę" dla aktywnego przypisania, pozwalająca na dodanie daty/godziny zakończenia.
* Funkcja "Anuluj przypisanie" dostępna tylko do momentu rozpoczęcia pracy w ramach danego zlecenia.

### 3.4. Główny widok aplikacji ("Tablica")

* Tabelaryczna lista wszystkich pracowników tymczasowych.
* Kolumny: `Imię i Nazwisko`, `Przypisane Miejsca Pracy`, `Godziny Pracy`, `Suma Godzin`.
* Sortowanie danych po wszystkich kolumnach.
* Filtrowanie pracowników po dacie i godzinie dostępności oraz wyszukiwanie tekstowe.
* Rozwijany wiersz dla każdego pracownika, wyświetlający szczegóły jego aktywnych przypisań.

### 3.5. Raportowanie i historia

* Dedykowany widok do generowania raportów przepracowanych godzin w zadanym zakresie dat.
* Możliwość eksportu wygenerowanego raportu do formatu CSV/Excel.
* Niezmienny dziennik zdarzeń (log audytowy) rejestrujący wszystkie operacje na przypisaniach (kto, co, kiedy).

## 4. Granice produktu

Następujące funkcjonalności są świadomie wyłączone z zakresu MVP:

* Brak narzędzi do automatycznej migracji danych z istniejących systemów.
* Pracownicy tymczasowi nie mają dostępu (loginu) do systemu.
* System nie wysyła żadnych automatycznych powiadomień (np. SMS, e-mail).
* System nie blokuje i nie ostrzega przed tworzeniem nakładających się czasowo przypisań. Odpowiedzialność za to leży po stronie Koordynatora.
* Brak zaawansowanych funkcji analitycznych poza podstawowym raportem godzin.

## 5. Historyjki użytkowników (User Stories)

### ID: US-001

* Tytuł: Logowanie do systemu
* Opis: Jako użytkownik (Administrator lub Koordynator), chcę móc bezpiecznie zalogować się do systemu, aby uzyskać dostęp do panelu.
* Kryteria akceptacji:
    1. System wyświetla stronę logowania z polami na login i hasło.
    2. Po podaniu poprawnych danych, użytkownik jest przekierowany do głównego widoku aplikacji ("Tablicy").
    3. Po podaniu niepoprawnych danych, system wyświetla komunikat o błędzie.

### ID: US-002

* Tytuł: Zarządzanie klientami przez Administratora
* Opis: Jako Administrator, chcę zarządzać listą klientów, aby utrzymywać aktualne dane w systemie.
* Kryteria akceptacji:
    1. Mogę wyświetlić listę wszystkich klientów.
    2. Mogę dodać nowego klienta, podając jego nazwę.
    3. Mogę edytować nazwę istniejącego klienta.
    4. Mogę usunąć klienta (jeśli nie ma powiązanych z nim Miejsc Pracy).

### ID: US-003

* Tytuł: Zarządzanie Miejscami Pracy przez Administratora
* Opis: Jako Administrator, chcę zarządzać Miejscami Pracy i przypisywać je do klientów, aby Koordynatorzy mogli tworzyć zlecenia w poprawnych lokalizacjach.
* Kryteria akceptacji:
    1. Mogę dodać nowe Miejsce Pracy, podając `Nazwę obiektu`, `Adres`, `E-mail`, `Telefon`.
    2. Każde Miejsce Pracy musi być przypisane do istniejącego Klienta.
    3. Mogę edytować dane istniejącego Miejsca Pracy.

### ID: US-004

* Tytuł: Zarządzanie pracownikami tymczasowymi
* Opis: Jako Koordynator, chcę szybko dodawać i edytować dane pracowników tymczasowych, aby utrzymywać aktualną bazę.
* Kryteria akceptacji:
    1. Mogę otworzyć formularz dodawania nowego pracownika.
    2. Formularz wymaga podania `Imienia`, `Nazwiska` i `Numeru telefonu`.
    3. Po zapisaniu, nowy pracownik pojawia się na głównej liście pracowników.
    4. Mogę edytować dane istniejącego pracownika.

### ID: US-005

* Tytuł: Wyświetlanie i filtrowanie listy pracowników
* Opis: Jako Koordynator, chcę widzieć listę wszystkich pracowników na jednym ekranie i filtrować ją, aby szybko znaleźć dostępne osoby.
* Kryteria akceptacji:
    1. Główny widok to tabela z listą pracowników.
    2. Mogę sortować listę, klikając na nagłówki kolumn (`Imię i Nazwisko`, `Suma Godzin`).
    3. Dostępny jest filtr daty i godziny (`Dostępny od`), który pokazuje tylko pracowników bez przypisań w danym momencie.
    4. Dostępne jest pole wyszukiwania, które filtruje listę po wpisaniu fragmentu imienia, nazwiska lub numeru telefonu.

### ID: US-006

* Tytuł: Tworzenie i przypisywanie pracownika do stanowiska
* Opis: Jako Koordynator, chcę stworzyć "Otwarte Stanowisko" w danym Miejscu Pracy, a następnie przypisać do niego pracownika.
* Kryteria akceptacji:
    1. Mogę utworzyć stanowisko (proste pole tekstowe) w kontekście wybranego Miejsca Pracy.
    2. Z poziomu listy pracowników mogę zainicjować akcję "Przypisz".
    3. W formularzu przypisania wybieram Miejsce Pracy, Stanowisko oraz podaję `datę i godzinę rozpoczęcia`.
    4. Opcjonalnie mogę podać `datę i godzinę zakończenia`.
    5. Po zapisaniu, przypisanie jest widoczne w rozwiniętym wierszu danego pracownika.

### ID: US-007

* Tytuł: Podgląd szczegółów przypisania
* Opis: Jako Koordynator, chcę widzieć szczegóły wszystkich przypisań danego pracownika, aby mieć pełen obraz jego grafiku.
* Kryteria akceptacji:
    1. Na liście pracowników, kliknięcie w wiersz rozwija go, pokazując listę przypisań.
    2. Każde przypisanie na liście pokazuje Miejsce Pracy, Stanowisko oraz godziny pracy w formacie `HH:MM - HH:MM`.
    3. Kolumna `Suma Godzin` w głównym wierszu pokazuje sumę czasu trwania wszystkich przypisań.

### ID: US-008

* Tytuł: Zakończenie aktywnego przypisania
* Opis: Jako Koordynator, chcę móc zakończyć aktywne przypisanie pracy, gdy pracownik faktycznie ją skończył.
* Kryteria akceptacji:
    1. Przy każdym przypisaniu bez daty końcowej widoczna jest akcja "Zakończ pracę".
    2. Po jej kliknięciu, pojawia się okno modalne do wprowadzenia daty i godziny zakończenia.
    3. Po zapisaniu, przypisanie zostaje zaktualizowane o datę końcową.

### ID: US-009

* Tytuł: Anulowanie błędnego przypisania
* Opis: Jako Koordynator, chcę mieć możliwość anulowania błędnie utworzonego przypisania, zanim ono się rozpocznie.
* Kryteria akceptacji:
    1. Przy każdym przypisaniu widoczna jest akcja "Anuluj przypisanie".
    2. Akcja jest aktywna tylko wtedy, gdy systemowy czas jest wcześniejszy niż data i godzina rozpoczęcia przypisania.
    3. Po kliknięciu akcji i potwierdzeniu, przypisanie zostaje trwale usunięte.
    4. Operacja anulowania jest odnotowana w dzienniku zdarzeń.

### ID: US-010

* Tytuł: Generowanie i eksport raportu godzin
* Opis: Jako Koordynator, chcę wygenerować raport przepracowanych godzin dla wybranego okresu i klienta, a następnie wyeksportować go do pliku w celu dalszego przetworzenia.
* Kryteria akceptacji:
    1. W dedykowanej sekcji "Raporty" mogę wybrać zakres dat.
    2. Po zatwierdzeniu, system generuje tabelę z podsumowaniem przepracowanych godzin z podziałem na pracowników i miejsca pracy.
    3. Na stronie z raportem znajduje się przycisk "Eksportuj do CSV/Excel".
    4. Kliknięcie przycisku powoduje pobranie pliku zawierającego dane z wygenerowanego raportu.

## 6. Metryki sukcesu

* Główny Cel Biznesowy: Usprawnienie i przyspieszenie procesu dopasowywania pracowników do otwartych stanowisk.
* Kluczowy Wskaźnik Sukcesu (KPI 1): Skrócenie średniego czasu od utworzenia "Otwartego Stanowiska" do przypisania pracownika o 30% w ciągu pierwszych 3 miesięcy od wdrożenia.
* Kluczowy Wskaźnik Sukcesu (KPI 2): Centralizacja 100% danych o pracownikach i ich harmonogramach w systemie, mierzona przez całkowite wyeliminowanie użycia zewnętrznych arkuszy kalkulacyjnych do planowania pracy w ciągu 3 miesięcy.
* Wskaźnik Adopcji: Aktywne korzystanie z panelu przez 90% pracowników agencji (docelowych użytkowników) w ciągu pierwszego miesiąca od wdrożenia.
