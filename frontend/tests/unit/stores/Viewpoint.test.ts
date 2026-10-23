import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { ViewPoint } from '$lib/state/Viewpoint.svelte';

class FakeVisualViewport extends EventTarget {
	height: number;

	constructor(height: number) {
		super();
		this.height = height;
	}

	resizeTo(height: number): void {
		this.height = height;
		this.dispatchEvent(new Event('resize'));
	}
}

function stubWindow(visualViewport: FakeVisualViewport | undefined, innerHeight = 800) {
	const win = Object.assign(new EventTarget(), {
		innerWidth: 400,
		innerHeight,
		visualViewport,
		matchMedia: (media: string) => ({
			matches: false,
			media,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		})
	});
	vi.stubGlobal('window', win);
	return win;
}

beforeEach(() => {
	vi.unstubAllGlobals();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('ViewPoint keyboardHeight', () => {
	it('is 0 when the visual viewport fills the window', () => {
		stubWindow(new FakeVisualViewport(800));
		const vp = new ViewPoint();
		expect(vp.keyboardHeight).toBe(0);
		vp.destroy();
	});

	it('is the height the keyboard takes once it opens', () => {
		const vv = new FakeVisualViewport(800);
		stubWindow(vv);
		const vp = new ViewPoint();
		vv.resizeTo(500);
		expect(vp.keyboardHeight).toBe(300);
		vp.destroy();
	});

	it('is measured on creation', () => {
		stubWindow(new FakeVisualViewport(450));
		const vp = new ViewPoint();
		expect(vp.keyboardHeight).toBe(350);
		vp.destroy();
	});

	it('ignores differences of 60px or less (browser chrome, jitter)', () => {
		const vv = new FakeVisualViewport(800);
		stubWindow(vv);
		const vp = new ViewPoint();
		vv.resizeTo(740);
		expect(vp.keyboardHeight).toBe(0);
		vv.resizeTo(739);
		expect(vp.keyboardHeight).toBe(61);
		vp.destroy();
	});

	it('updates on scroll of the visual viewport', () => {
		const vv = new FakeVisualViewport(800);
		stubWindow(vv);
		const vp = new ViewPoint();
		vv.height = 400;
		vv.dispatchEvent(new Event('scroll'));
		expect(vp.keyboardHeight).toBe(400);
		vp.destroy();
	});

	it('goes back to 0 when the keyboard closes', () => {
		const vv = new FakeVisualViewport(800);
		stubWindow(vv);
		const vp = new ViewPoint();
		vv.resizeTo(500);
		vv.resizeTo(800);
		expect(vp.keyboardHeight).toBe(0);
		vp.destroy();
	});

	it('stops listening after destroy', () => {
		const vv = new FakeVisualViewport(800);
		stubWindow(vv);
		const vp = new ViewPoint();
		vp.destroy();
		vv.resizeTo(500);
		expect(vp.keyboardHeight).toBe(0);
	});

	it('stays 0 without a visual viewport', () => {
		stubWindow(undefined);
		const vp = new ViewPoint();
		expect(vp.keyboardHeight).toBe(0);
		vp.destroy();
	});
});
