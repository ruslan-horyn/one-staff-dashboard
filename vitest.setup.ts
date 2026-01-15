import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './__mocks__/server';

// Mock ResizeObserver for components using cmdk/Radix
class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock scrollIntoView for cmdk
Element.prototype.scrollIntoView = () => {};

// Automatic cleanup after each test
afterEach(() => {
	cleanup();
});

// MSW Server setup
beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});
