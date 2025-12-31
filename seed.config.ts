import { SeedPostgres } from '@snaplet/seed/adapter-postgres';
import { defineConfig } from '@snaplet/seed/config';
import postgres from 'postgres';

export default defineConfig({
	adapter: () => {
		const client = postgres(
			'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
		);
		return new SeedPostgres(client);
	},
	select: [
		'!*', // Exclude all by default
		'public*', // Include public schema
		'auth.users', // Include auth tables
		'auth.identities',
	],
});
