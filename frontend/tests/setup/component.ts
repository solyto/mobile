import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Under the browser resolve condition the SvelteKit env virtual module is not
// initialised by Vitest, so give it an empty public env (platform.ts reads it
// at module load).
vi.mock('$env/dynamic/public', () => ({ env: {} }));

// jsdom lacks Element.prototype.animate, which Svelte transitions use.
// Svelte's transition runner drives the outro/intro lifecycle through the
// animation's `onfinish` callback, so the stub invokes it once assigned
// (mimicking a completed animation) and supports cancel().
class FakeAnimation {
	private _onfinish: (() => void) | null = null;
	currentTime = 0;
	playState = 'finished';
	finished = Promise.resolve();
	effect: unknown = null;

	set onfinish(fn: (() => void) | null) {
		this._onfinish = fn;
		if (fn) queueMicrotask(() => this._onfinish?.());
	}

	get onfinish() {
		return this._onfinish;
	}

	cancel = vi.fn(() => {
		this.playState = 'idle';
		this._onfinish = null;
	});

	addEventListener = vi.fn();
	removeEventListener = vi.fn();
	play = vi.fn(() => {
		this.playState = 'running';
	});
	pause = vi.fn();
	reverse = vi.fn();
}

if (!Element.prototype.animate) {
	Element.prototype.animate = vi.fn(() => new FakeAnimation()) as never;
}

// jsdom lacks matchMedia, which ViewPoint and some components use
if (!window.matchMedia) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	})) as never;
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
