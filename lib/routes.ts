import type { Route } from 'next';

export const routes = {
	home: '/',
	board: '/board',
	login: '/login',
	register: '/register',
	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',
	workers: '/workers',
	clients: '/clients',
	locations: '/locations',
	reports: '/reports',
	users: '/users',
	privacy: '/privacy',
} as const satisfies Record<string, Route>;
