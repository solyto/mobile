import { getContext, setContext } from 'svelte';
import { themes, type Theme } from '$lib/config/themes';
import LocalStorageService from '$lib/services/LocalStorageService';

export class ThemeState {
	static readonly LS_THEME_KEY: string = 'theme';
	static readonly LS_ANIMATIONS_KEY: string = 'animations';
	static readonly LS_APPEARANCE_KEY: string = 'appearance';
	static readonly LS_FLAT_NAVIGATION_KEY: string = 'flat_navigation';
	static readonly LS_BOTTOM_NAVIGATION_KEY: string = 'bottom_navigation';

	theme = $state<Theme>(themes[0]);
	animations = $state<boolean>(true);
	appearance = $state<'system' | 'light' | 'dark'>('system');
	flatNavigation = $state<boolean>(false);
	bottomNavigation = $state<boolean>(false);
	link: HTMLLinkElement | null = null;
	mediaQuery: MediaQueryList | null = null;
	darkListener: ((e: MediaQueryListEvent) => void) | null = null;
	localStorage = new LocalStorageService();

	load(): void {
		const savedAppearance = this.localStorage.get(ThemeState.LS_APPEARANCE_KEY);
		if (savedAppearance === 'light' || savedAppearance === 'dark') {
			this.appearance = savedAppearance;
		}

		this.flatNavigation = this.localStorage.getBool(ThemeState.LS_FLAT_NAVIGATION_KEY) ?? false;
		this.bottomNavigation = this.localStorage.getBool(ThemeState.LS_BOTTOM_NAVIGATION_KEY) ?? false;

		const saved = this.localStorage.get(ThemeState.LS_THEME_KEY) ?? 'default';
		this.apply(themes.find((t) => t.id === saved) ?? themes[0]);

		const savedAnimations = this.localStorage.getBool(ThemeState.LS_ANIMATIONS_KEY);
		this.applyAnimations(savedAnimations ?? true);
	}

	setTheme(theme: Theme): void {
		this.localStorage.set(ThemeState.LS_THEME_KEY, theme.id);
		this.apply(theme);
	}

	setAppearance(appearance: 'system' | 'light' | 'dark'): void {
		this.localStorage.set(ThemeState.LS_APPEARANCE_KEY, appearance);
		this.appearance = appearance;

		if (this.theme.supportsDarkMode) {
			this.teardownDarkListener();
			this.applyAppearance();
		}
	}

	setFlatNavigation(enabled: boolean): void {
		this.localStorage.setBool(ThemeState.LS_FLAT_NAVIGATION_KEY, enabled);
		this.flatNavigation = enabled;
		this.applyFlatNavigation();
	}

	setBottomNavigation(enabled: boolean): void {
		this.localStorage.setBool(ThemeState.LS_BOTTOM_NAVIGATION_KEY, enabled);
		this.bottomNavigation = enabled;
		this.applyBottomNavigation();
	}

	setAnimations(enabled: boolean): void {
		this.localStorage.setBool(ThemeState.LS_ANIMATIONS_KEY, enabled);
		this.applyAnimations(enabled);
	}

	applyAnimations(enabled: boolean): void {
		this.animations = enabled;
		document.documentElement.classList.toggle('no-animations', !enabled);
		if (!enabled) ThemeState.patchAnimate();
	}

	private static animatePatched = false;

	static patchAnimate(): void {
		if (ThemeState.animatePatched) return;
		ThemeState.animatePatched = true;

		const original = Element.prototype.animate;
		Element.prototype.animate = function (keyframes, options) {
			if (document.documentElement.classList.contains('no-animations')) {
				if (typeof options === 'object' && options !== null) {
					options = { ...options, duration: 0, delay: 0 };
				} else {
					options = 0;
				}
			}
			return original.call(this, keyframes, options);
		};
	}

	apply(theme: Theme): void {
		this.theme = theme;

		this.link?.remove();
		if (theme.id !== 'default') {
			this.link = document.createElement('link');
			this.link.rel = 'stylesheet';
			this.link.href = `/themes/${theme.id}/${theme.id}.css`;
			document.head.appendChild(this.link);
		}

		document.documentElement.classList.toggle(
			'theme-dark',
			!theme.supportsDarkMode && ThemeState.isDarkTheme(theme)
		);

		this.applyFlatNavigation();
		this.applyBottomNavigation();
		this.teardownDarkListener();

		if (theme.supportsDarkMode) {
			this.applyAppearance();
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	private static isDarkTheme(theme: Theme): boolean {
		const hex = theme.previewBg.replace('#', '');
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		return luminance < 140;
	}

	private applyFlatNavigation(): void {
		document.documentElement.classList.toggle('flat-nav', this.theme.supportsFlatNavigation && this.flatNavigation);
	}

	private applyBottomNavigation(): void {
		document.documentElement.classList.toggle('bottom-nav', this.theme.supportsBottomNavigation && this.bottomNavigation);
	}

	applyDark(dark: boolean): void {
		document.documentElement.classList.toggle('dark', dark);
	}

	private teardownDarkListener(): void {
		if (this.mediaQuery && this.darkListener) {
			this.mediaQuery.removeEventListener('change', this.darkListener);
			this.darkListener = null;
		}
	}

	private applyAppearance(): void {
		if (this.appearance === 'system') {
			this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			this.darkListener = (e) => this.applyDark(e.matches);
			this.mediaQuery.addEventListener('change', this.darkListener);
			this.applyDark(this.mediaQuery.matches);
		} else {
			this.applyDark(this.appearance === 'dark');
		}
	}
}

const THEME_KEY = Symbol('SOLYTO_THEME');

export function setThemeState(): ThemeState {
	return setContext(THEME_KEY, new ThemeState());
}

export function getThemeState(): ThemeState {
	return getContext<ThemeState>(THEME_KEY);
}
