import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as utils from '@/utils';
import { useIsMobile } from '../useIsMobile';

describe('useIsMobile', () => {
	const originalInnerWidth = window.innerWidth;
	let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void> = [];

	const mockMatchMedia = (matches: boolean) => {
		return vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(
				(event: string, listener: (e: MediaQueryListEvent) => void) => {
					if (event === 'change') {
						mediaQueryListeners.push(listener);
					}
				}
			),
			removeEventListener: vi.fn(
				(event: string, listener: (e: MediaQueryListEvent) => void) => {
					if (event === 'change') {
						mediaQueryListeners = mediaQueryListeners.filter(
							(l) => l !== listener
						);
					}
				}
			),
			dispatchEvent: vi.fn(),
		}));
	};

	const setWindowWidth = (width: number) => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: width,
		});
	};

	beforeEach(() => {
		mediaQueryListeners = [];
	});

	afterEach(() => {
		setWindowWidth(originalInnerWidth);
		vi.restoreAllMocks();
	});

	describe('initial state', () => {
		it('returns true when window width is below mobile breakpoint', () => {
			setWindowWidth(767);
			window.matchMedia = mockMatchMedia(true);

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(true);
		});

		it('returns false when window width is at mobile breakpoint', () => {
			setWindowWidth(768);
			window.matchMedia = mockMatchMedia(false);

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});

		it('returns false when window width is above mobile breakpoint', () => {
			setWindowWidth(1024);
			window.matchMedia = mockMatchMedia(false);

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});
	});

	describe('responsive behavior', () => {
		it('updates when window resizes to mobile width', () => {
			setWindowWidth(1024);
			window.matchMedia = mockMatchMedia(false);

			const { result } = renderHook(() => useIsMobile());
			expect(result.current).toBe(false);

			act(() => {
				setWindowWidth(500);
				mediaQueryListeners.forEach((listener) =>
					listener({ matches: true } as MediaQueryListEvent)
				);
			});

			expect(result.current).toBe(true);
		});

		it('updates when window resizes to desktop width', () => {
			setWindowWidth(500);
			window.matchMedia = mockMatchMedia(true);

			const { result } = renderHook(() => useIsMobile());
			expect(result.current).toBe(true);

			act(() => {
				setWindowWidth(1024);
				mediaQueryListeners.forEach((listener) =>
					listener({ matches: false } as MediaQueryListEvent)
				);
			});

			expect(result.current).toBe(false);
		});
	});

	describe('cleanup', () => {
		it('removes event listener on unmount', () => {
			setWindowWidth(1024);
			const matchMediaMock = mockMatchMedia(false);
			window.matchMedia = matchMediaMock;

			const { unmount } = renderHook(() => useIsMobile());

			unmount();

			const mqlInstance = matchMediaMock.mock.results[0].value;
			expect(mqlInstance.removeEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
		});
	});

	describe('SSR', () => {
		it('returns false when window is undefined (SSR)', () => {
			vi.spyOn(utils, 'getWindow').mockReturnValue(undefined);

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});
	});
});
