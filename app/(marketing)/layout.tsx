import type { Metadata } from 'next';
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
	return <>{children}</>;
}
