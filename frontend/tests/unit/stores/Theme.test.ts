import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeState } from '$lib/state/Theme.svelte';
import { themes } from '$lib/config/themes';
import { storage, resetStoreMocks } from '../setup/storeMocks';

// Theme manipulates document/window/Element, none of which exist in the node
// environment of the stores project — build minimal stand-ins per test.
function setupDom() {
	const classList = {
		toggle: vi.fn(),
		contains: vi.fn(() => false),
		add: vi.fn(),
		remove: vi.fn()
	};
	const linkElement = { rel: '', href: '', remove: vi.fn() };
	const mediaQuery = {
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	};

	vi.stubGlobal('document', {
		documentElement: { classList },
		head: { appendChild: vi.fn() },
		createElement: vi.fn(() => linkElement)
	});
	vi.stubGlobal('window', { matchMedia: vi.fn(() => mediaQuery) });

	const animate = vi.fn();
	// Element must stay callable (code does `x instanceof Element`), so use a
	// real class and attach the animate spy to its prototype.
	class FakeElement {}
	(FakeElement as { prototype: { animate?: unknown } }).prototype.animate = animate;
	vi.stubGlobal('Element', FakeElement as unknown as typeof Element);

	return { classList, linkElement, mediaQuery, animate };
}

function resetAnimatePatched() {
	(ThemeState as unknown as { animatePatched: boolean }).animatePatched = false;
}

const nord = themes.find((t) => t.id === 'nord')!;
const defaultTheme = themes[0];

beforeEach(() => {
	resetStoreMocks();
	resetAnimatePatched();
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('Theme store', () => {
	describe('load', () => {
		it('applies the saved theme and animation preference', () => {
			const dom = setupDom();
			storage.get.mockReturnValue('nord');
			storage.getBool.mockReturnValue(false);

			const s = new ThemeState();
			s.load();

			expect(s.theme.id).toBe('nord');
			expect(document.createElement).toHaveBeenCalledWith('link');
			expect(dom.linkElement.href).toBe('/themes/nord/nord.css');
			expect(document.head.appendChild).toHaveBeenCalledWith(dom.linkElement);
			expect(s.animations).toBe(false);
			expect(dom.classList.toggle).toHaveBeenCalledWith('no-animations', true);
			expect(dom.animate).not.toHaveBeenCalled();
		});

		it('falls back to the default theme for unknown ids', () => {
			setupDom();
			storage.get.mockReturnValue('bogus');
			storage.getBool.mockReturnValue(true);

			const s = new ThemeState();
			s.load();

			expect(s.theme).toBe(defaultTheme);
			// default theme is not loaded as a stylesheet
			expect(document.createElement).not.toHaveBeenCalled();
		});

		it('does not patch animate while animations are enabled', () => {
			const dom = setupDom();
			storage.get.mockReturnValue(null);
			storage.getBool.mockReturnValue(true);

			const s = new ThemeState();
			s.load();

			expect(dom.animate).not.toHaveBeenCalled();
		});
	});

	describe('setTheme', () => {
		it('persists the id and applies the theme', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.setTheme(nord);

			expect(storage.set).toHaveBeenCalledWith(ThemeState.LS_THEME_KEY, 'nord');
			expect(s.theme).toBe(nord);
			expect(dom.linkElement.href).toBe('/themes/nord/nord.css');
		});

		it('switching back to default removes the theme link', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.setTheme(nord);
			s.setTheme(defaultTheme);

			expect(dom.linkElement.remove).toHaveBeenCalled();
			expect(s.theme).toBe(defaultTheme);
		});
	});

	describe('setAnimations', () => {
		it('persists and disables animations', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.setAnimations(false);

			expect(storage.setBool).toHaveBeenCalledWith(ThemeState.LS_ANIMATIONS_KEY, false);
			expect(s.animations).toBe(false);
			expect(dom.classList.toggle).toHaveBeenCalledWith('no-animations', true);
		});

		it('patched animate forces zero duration when no-animations is set', () => {
			const dom = setupDom();
			dom.classList.contains.mockReturnValue(true);
			const s = new ThemeState();
			s.setAnimations(false);

			// patchAnimate replaced Element.prototype.animate once
			const patched = (
				globalThis.Element as unknown as {
					prototype: { animate: (...args: unknown[]) => unknown };
				}
			).prototype.animate;
			patched([], { duration: 300 });
			expect(dom.animate).toHaveBeenCalledWith([], { duration: 0, delay: 0 });
		});
	});

	describe('dark mode', () => {
		it('registers a media-query listener for themes that support dark mode', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);

			expect(dom.mediaQuery.addEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
			expect(dom.classList.toggle).toHaveBeenCalledWith('dark', false);
		});

		it('reacts to media-query changes', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);

			const listener = dom.mediaQuery.addEventListener.mock.calls[0][1] as (e: {
				matches: boolean;
			}) => void;
			listener({ matches: true });

			expect(dom.classList.toggle).toHaveBeenCalledWith('dark', true);
		});

		it('removes the dark class for themes without dark mode', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(nord);

			expect(dom.mediaQuery.addEventListener).not.toHaveBeenCalled();
			expect(dom.classList.remove).toHaveBeenCalledWith('dark');
		});

		it('replacing a dark-capable theme removes the old listener', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);
			s.apply(nord);

			expect(dom.mediaQuery.removeEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
		});
	});

	describe('flat navigation', () => {
		it('loads the saved preference and applies it to a supporting theme', () => {
			const dom = setupDom();
			storage.get.mockReturnValue('nord');
			storage.getBool.mockReturnValue(true);

			const s = new ThemeState();
			s.load();

			expect(s.flatNavigation).toBe(true);
			expect(dom.classList.toggle).toHaveBeenCalledWith('flat-nav', true);
		});

		it('setFlatNavigation persists and applies the preference', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(nord);
			s.setFlatNavigation(true);

			expect(storage.setBool).toHaveBeenCalledWith(ThemeState.LS_FLAT_NAVIGATION_KEY, true);
			expect(dom.classList.toggle).toHaveBeenLastCalledWith('flat-nav', true);
		});

		it('is not applied for themes that style their own navigation', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.setFlatNavigation(true);
			s.apply(themes.find((t) => t.id === 'skyrim')!);

			expect(s.flatNavigation).toBe(true);
			expect(dom.classList.toggle).toHaveBeenCalledWith('flat-nav', false);
		});
	});

	describe('bottom navigation', () => {
		it('setBottomNavigation persists and applies the preference', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(themes.find((t) => t.id === '95')!);
			s.setBottomNavigation(true);

			expect(storage.setBool).toHaveBeenCalledWith(ThemeState.LS_BOTTOM_NAVIGATION_KEY, true);
			expect(dom.classList.toggle).toHaveBeenLastCalledWith('bottom-nav', true);
		});

		it('is not applied for themes that do not support it', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.setBottomNavigation(true);
			s.apply(nord);

			expect(s.bottomNavigation).toBe(true);
			expect(dom.classList.toggle).toHaveBeenCalledWith('bottom-nav', false);
		});
	});

	describe('appearance', () => {
		it('loads a saved forced appearance and does not follow the OS', () => {
			const dom = setupDom();
			storage.get.mockImplementation((key: string) =>
				key === ThemeState.LS_APPEARANCE_KEY ? 'dark' : 'default'
			);
			storage.getBool.mockReturnValue(true);

			const s = new ThemeState();
			s.load();

			expect(s.appearance).toBe('dark');
			expect(dom.classList.toggle).toHaveBeenCalledWith('dark', true);
			expect(dom.mediaQuery.addEventListener).not.toHaveBeenCalled();
		});

		it('ignores unknown appearance values and falls back to system', () => {
			const dom = setupDom();
			storage.get.mockImplementation((key: string) =>
				key === ThemeState.LS_APPEARANCE_KEY ? 'sepia' : 'default'
			);
			storage.getBool.mockReturnValue(true);

			const s = new ThemeState();
			s.load();

			expect(s.appearance).toBe('system');
			expect(dom.mediaQuery.addEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
		});

		it('setAppearance persists forced dark and removes the OS listener', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);

			s.setAppearance('dark');

			expect(storage.set).toHaveBeenCalledWith(ThemeState.LS_APPEARANCE_KEY, 'dark');
			expect(dom.mediaQuery.removeEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
			expect(s.appearance).toBe('dark');
			expect(dom.classList.toggle).toHaveBeenCalledWith('dark', true);
		});

		it('setAppearance forced light drops the dark class', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);

			s.setAppearance('light');

			expect(storage.set).toHaveBeenCalledWith(ThemeState.LS_APPEARANCE_KEY, 'light');
			expect(s.appearance).toBe('light');
			expect(dom.classList.toggle).toHaveBeenCalledWith('dark', false);
			expect(dom.mediaQuery.addEventListener).toHaveBeenCalledTimes(1);
		});

		it('switching back to system re-registers the OS listener', () => {
			const dom = setupDom();
			const s = new ThemeState();
			s.apply(defaultTheme);
			s.setAppearance('light');

			dom.mediaQuery.addEventListener.mockClear();
			s.setAppearance('system');

			expect(s.appearance).toBe('system');
			expect(dom.mediaQuery.addEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function)
			);
		});
	});
});
