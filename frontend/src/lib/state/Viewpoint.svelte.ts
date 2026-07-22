import { setContext, getContext } from 'svelte';
import { browser } from '$app/environment';

interface ViewPointState {
	width: number;
	height: number;
	isDesktop: boolean;
	isMobile: boolean;
	isTablet: boolean;
}

export class ViewPoint {
	private _state = $state<ViewPointState>({
		width: 0,
		height: 0,
		isDesktop: false,
		isMobile: true,
		isTablet: false
	});

	private mediaQueries: MediaQueryList[] = [];
	private cleanup: (() => void)[] = [];

	constructor() {
		if (browser) {
			this.initialize();
		}
	}

	private initialize() {
		const desktopQuery = window.matchMedia('(min-width: 96rem)');
		const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 80rem)');

		this.mediaQueries = [desktopQuery, tabletQuery];

		const updateScreenSize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			this._state.width = width;
			this._state.height = height;
			this._state.isDesktop = desktopQuery.matches;
			this._state.isTablet = tabletQuery.matches;
			this._state.isMobile = !desktopQuery.matches && !tabletQuery.matches;
		};

		updateScreenSize();

		const resizeHandler = () => updateScreenSize();
		window.addEventListener('resize', resizeHandler);
		this.cleanup.push(() => window.removeEventListener('resize', resizeHandler));

		this.mediaQueries.forEach((mq) => {
			const handler = () => updateScreenSize();
			mq.addEventListener('change', handler);
			this.cleanup.push(() => mq.removeEventListener('change', handler));
		});
	}

	get state() {
		return this._state;
	}

	get width() {
		return this._state.width;
	}
	get height() {
		return this._state.height;
	}
	get isDesktop() {
		return this._state.isDesktop;
	}
	get isMobile() {
		return this._state.isMobile;
	}
	get isTablet() {
		return this._state.isTablet;
	}

	destroy() {
		this.cleanup.forEach((fn) => fn());
		this.cleanup = [];
	}
}

const VIEWPOINT_KEY = Symbol('SOLYTO_VIEWPOINT');

export function setViewPoint(): ViewPoint {
	return setContext(VIEWPOINT_KEY, new ViewPoint());
}

export function getViewPoint(): ViewPoint {
	return getContext<ViewPoint>(VIEWPOINT_KEY);
}
