import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Polityka prywatności — One Staff Dashboard',
};

export default function PrivacyPage() {
	return (
		<main className="mx-auto max-w-[720px] px-4 py-8 leading-[1.7]">
			<Link href="/">← Wróć na stronę główną</Link>

			<h1>Polityka prywatności</h1>
			<p>
				<strong>Ostatnia aktualizacja:</strong> 14 kwietnia 2026
			</p>

			<h2>1. Administrator danych</h2>
			<p>
				Administratorem danych osobowych jest:{' '}
				<strong>[WPISZ: Twoje imię i nazwisko lub nazwa firmy]</strong>, email:{' '}
				<strong>[WPISZ: twoj@email.com]</strong>.
			</p>

			<h2>2. Jakie dane zbieramy</h2>
			<p>
				Zbieramy wyłącznie adres email podany dobrowolnie w formularzu zapisu na
				listę oczekujących (waitlistę).
			</p>

			<h2>3. Cel i podstawa przetwarzania</h2>
			<p>
				Adres email przetwarzamy w celu poinformowania Cię o uruchomieniu
				aplikacji One Staff Dashboard. Podstawą prawną jest Twoja zgoda (art. 6
				ust. 1 lit. a RODO).
			</p>

			<h2>4. Czas przechowywania danych</h2>
			<p>
				Dane przechowujemy do momentu uruchomienia produktu lub do czasu
				wycofania przez Ciebie zgody, w zależności od tego, co nastąpi
				wcześniej.
			</p>

			<h2>5. Twoje prawa</h2>
			<p>
				Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia
				przetwarzania oraz przenoszenia.
			</p>

			<h2>6. Jak usunąć swoje dane</h2>
			<p>
				Napisz na <strong>[WPISZ: twoj@email.com]</strong> — usuniemy Twój adres
				email w ciągu 72 godzin.
			</p>

			<h2>7. Pliki cookies</h2>
			<p>
				Strona nie używa plików cookies śledzących ani narzędzi analitycznych
				zbierających dane osobowe.
			</p>
		</main>
	);
}
