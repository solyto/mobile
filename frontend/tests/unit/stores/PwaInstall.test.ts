import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PwaInstall } from '$lib/state/PwaInstall.svelte';
import { resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('PwaInstall store', () => {
	it('starts inert when there is no window', () => {
		const s = new PwaInstall();
		expect(s.installed).toBe(false);
		expect(s.canInstall).toBe(false);
		expect(s.deferredPrompt).toBeNull();
	});

	describe('isIos', () => {
		it('is false without a navigator', () => {
			// hide the node navigator global for this test
			const nav = globalThis.navigator;
			vi.stubGlobal('navigator', undefined);
			const s = new PwaInstall();
			expect(s.isIos).toBe(false);
			vi.stubGlobal('navigator', nav);
		});

		it('detects iphone user agents', () => {
			vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
			});
			const s = new PwaInstall();
			expect(s.isIos).toBe(true);
		});

		it('rejects desktop user agents', () => {
			vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' });
			const s = new PwaInstall();
			expect(s.isIos).toBe(false);
		});
	});

	describe('captureEvent', () => {
		it('captures the prompt event and enables installation', () => {
			const s = new PwaInstall();
			const event = { preventDefault: vi.fn(), prompt: vi.fn(), userChoice: {} };
			s.captureEvent(event as unknown as Event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(s.canInstall).toBe(true);
			expect(s.deferredPrompt).toBe(event);
		});
	});

	describe('install', () => {
		it('marks the app as installed when the user accepts', async () => {
			const s = new PwaInstall();
			const prompt = vi.fn().mockResolvedValue(undefined);
			const userChoice = Promise.resolve({ outcome: 'accepted' });
			s.captureEvent({ preventDefault: vi.fn(), prompt, userChoice } as unknown as Event);

			await s.install();

			expect(prompt).toHaveBeenCalled();
			expect(s.installed).toBe(true);
			expect(s.deferredPrompt).toBeNull();
			expect(s.canInstall).toBe(false);
		});

		it('stays uninstalled when the user dismisses', async () => {
			const s = new PwaInstall();
			const prompt = vi.fn().mockResolvedValue(undefined);
			const userChoice = Promise.resolve({ outcome: 'dismissed' });
			s.captureEvent({ preventDefault: vi.fn(), prompt, userChoice } as unknown as Event);

			await s.install();

			expect(s.installed).toBe(false);
			expect(s.deferredPrompt).toBeNull();
		});

		it('is a no-op without a deferred prompt', async () => {
			const s = new PwaInstall();
			await s.install();
			expect(s.installed).toBe(false);
		});
	});

	describe('constructor with a window', () => {
		it('detects a standalone display mode', () => {
			const addEventListener = vi.fn();
			const matchMedia = vi.fn().mockReturnValue({ matches: true });
			vi.stubGlobal('window', { matchMedia, addEventListener });

			const s = new PwaInstall();

			expect(matchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
			expect(s.installed).toBe(true);
			expect(addEventListener).toHaveBeenCalledWith(
				'beforeinstallprompt',
				expect.any(Function)
			);
		});

		it('captures an existing prompt from the window', () => {
			const prompt = { preventDefault: vi.fn(), prompt: vi.fn(), userChoice: {} };
			vi.stubGlobal('window', {
				matchMedia: vi.fn().mockReturnValue({ matches: false }),
				addEventListener: vi.fn(),
				__pwaPrompt: prompt
			});

			const s = new PwaInstall();

			expect(s.deferredPrompt).toBe(prompt);
		});
	});
});
