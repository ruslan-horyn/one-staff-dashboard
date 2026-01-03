import { HttpResponse, http } from 'msw';

export const authHandlers = [
	// Sign in with password
	http.post('*/auth/v1/token', async ({ request }) => {
		const url = new URL(request.url);
		const grantType = url.searchParams.get('grant_type');

		if (grantType === 'password') {
			return HttpResponse.json({
				access_token: 'mock-access-token',
				token_type: 'bearer',
				expires_in: 3600,
				refresh_token: 'mock-refresh-token',
				user: {
					id: 'user-123',
					email: 'test@example.com',
					role: 'authenticated',
				},
			});
		}

		return HttpResponse.json(
			{ error: 'invalid_grant', error_description: 'Invalid grant type' },
			{ status: 400 }
		);
	}),

	// Get user
	http.get('*/auth/v1/user', () => {
		return HttpResponse.json({
			id: 'user-123',
			email: 'test@example.com',
			role: 'authenticated',
		});
	}),

	// Sign out
	http.post('*/auth/v1/logout', () => {
		return new HttpResponse(null, { status: 204 });
	}),
];
