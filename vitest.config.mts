import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		// Environment
		environment: 'jsdom',
		globals: true,

		// Setup files
		setupFiles: ['./vitest.setup.ts'],

		// Test file patterns (colocation + __tests__ folders)
		include: [
			'**/*.test.{ts,tsx}',
			'**/*.spec.{ts,tsx}',
			'**/__tests__/**/*.test.{ts,tsx}',
		],
		exclude: ['node_modules', '.next', 'e2e/**'],

		// Coverage
		coverage: {
			provider: 'v8',
			enabled: false, // Enable via CLI: --coverage
			reporter: ['text', 'text-summary', 'html', 'lcov'],
			reportsDirectory: './coverage',

			// Coverage thresholds - 90% for new code
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90,
			},

			// Files to analyze for coverage
			include: [
				'components/**/*.{ts,tsx}',
				'hooks/**/*.{ts,tsx}',
				'services/**/*.{ts,tsx}',
				'stores/**/*.{ts,tsx}',
				'utils/**/*.{ts,tsx}',
			],
			exclude: [
				'**/*.test.{ts,tsx}',
				'**/*.spec.{ts,tsx}',
				'**/__tests__/**',
				'**/index.ts',
				'**/*.d.ts',
				'types/**',
				'lib/**',
				'__mocks__/**',
			],
		},

		// Timeout for async tests
		testTimeout: 10000,

		// Test isolation
		isolate: true,
		restoreMocks: true,
	},
});
