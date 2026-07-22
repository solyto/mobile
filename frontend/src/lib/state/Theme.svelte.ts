import { getContext, setContext } from 'svelte';
import { themes, type Theme } from '$lib/config/themes';
import LocalStorageService from '$lib/services/LocalStorageService';

export class ThemeState {
	static readonly LS_THEME_KEY: string = 'theme';
	static readonly LS_ANIMATIONS_KEY: string = 'animations';

	theme = $state<Theme>(themes[0]);
	animations = $state<boolean>(true);
	link: HTMLLinkElement | null = null;
	mediaQuery: MediaQueryList | null = null;
	darkListener: ((e: MediaQueryListEvent) => void) | null = null;
	localStorage = new LocalStorageService();

	load(): void {
		const saved = this.localStorage.get(ThemeState.LS_THEME_KEY) ?? 'default';
		this.apply(themes.find((t) => t.id === saved) ?? themes[0]);

		const savedAnimations = this.localStorage.getBool(ThemeState.LS_ANIMATIONS_KEY);
		this.applyAnimations(savedAnimations ?? true);
	}

	setTheme(theme: Theme): void {
		this.localStorage.set(ThemeState.LS_THEME_KEY, theme.id);
		this.apply(theme);
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

		if (this.mediaQuery && this.darkListener) {
			this.mediaQuery.removeEventListener('change', this.darkListener);
			this.darkListener = null;
		}

		if (theme.supportsDarkMode) {
			this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			this.darkListener = (e) => this.applyDark(e.matches);
			this.mediaQuery.addEventListener('change', this.darkListener);
			this.applyDark(this.mediaQuery.matches);
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	applyDark(dark: boolean): void {
		document.documentElement.classList.toggle('dark', dark);
	}
}

const THEME_KEY = Symbol('SOLYTO_THEME');

export function setThemeState(): ThemeState {
	return setContext(THEME_KEY, new ThemeState());
}

export function getThemeState(): ThemeState {
	return getContext<ThemeState>(THEME_KEY);
}
