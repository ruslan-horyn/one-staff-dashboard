'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const AUTH_MESSAGES: Record<
	string,
	{ type: 'success' | 'error'; message: string }
> = {
	email_verified: {
		type: 'success',
		message: 'Email verified successfully! Welcome to the dashboard.',
	},
};

export const AuthToastHandler = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const messageKey = searchParams.get('message');

		if (messageKey && AUTH_MESSAGES[messageKey]) {
			const { type, message } = AUTH_MESSAGES[messageKey];

			toast[type](message);

			const params = new URLSearchParams(searchParams.toString());
			params.delete('message');
			const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
			router.replace(newUrl, { scroll: false });
		}
	}, [searchParams, router, pathname]);

	return null;
};
