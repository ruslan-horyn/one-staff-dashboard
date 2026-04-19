import type { Metadata } from 'next';
import Script from 'next/script';
import './landing.css';

export const metadata: Metadata = {
	title: 'One Staff Dashboard — zarządzaj pracownikami tymczasowymi bez Excela',
	description:
		'Centralne źródło prawdy dla agencji pracy tymczasowej. Zarządzaj pracownikami, klientami i przypisaniami w jednym miejscu.',
};

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<Script src="/landing-script.js" strategy="afterInteractive" />
		</>
	);
}
