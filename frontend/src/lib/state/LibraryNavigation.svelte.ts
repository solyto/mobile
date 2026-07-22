import type { LibraryType } from '$lib/types/library';
import { getContext, setContext } from 'svelte';
import { page } from '$app/state';
import { urls } from '$lib/config/urls';
import IconMusic from '@lucide/svelte/icons/music';
import IconBook from '@lucide/svelte/icons/book';
import IconClapperboard from '@lucide/svelte/icons/clapperboard';
import IconGamepad2 from '@lucide/svelte/icons/gamepad-2';
import IconLink from '@lucide/svelte/icons/link';
import IconQuote from '@lucide/svelte/icons/quote';
import IconCookingPot from '@lucide/svelte/icons/cooking-pot';
import IconLeaf from '@lucide/svelte/icons/leaf';

export const navigationItems: { type: LibraryType; url: string; icon: any }[] = [
	{ type: 'music', url: urls.musicLibrary, icon: IconMusic },
	{ type: 'books', url: urls.bookLibrary, icon: IconBook },
	{ type: 'movies', url: urls.movieLibrary, icon: IconClapperboard },
	{ type: 'games', url: urls.gameLibrary, icon: IconGamepad2 },
	{ type: 'links', url: urls.linkLibrary, icon: IconLink },
	{ type: 'quotes', url: urls.quoteLibrary, icon: IconQuote },
	{ type: 'recipes', url: urls.recipeLibrary, icon: IconCookingPot },
	{ type: 'plants', url: urls.plantLibrary, icon: IconLeaf }
];

export class LibraryNavigation {
	activeLibrary = $state<LibraryType | null>(null);

	constructor() {
		this.activeLibrary = this.getLibraryType();
	}

	getLibraryType(): LibraryType | null {
		if (page.url.pathname.includes('music')) return 'music';
		if (page.url.pathname.includes('books')) return 'books';
		if (page.url.pathname.includes('links')) return 'links';
		if (page.url.pathname.includes('quotes')) return 'quotes';
		if (page.url.pathname.includes('recipes')) return 'recipes';
		if (page.url.pathname.includes('movies')) return 'movies';
		if (page.url.pathname.includes('games')) return 'games';
		if (page.url.pathname.includes('plants')) return 'plants';
		return null;
	}
}

const LIBRARY_NAVIGATION_KEY = Symbol('SOLYTO_LIBRARY_NAVIGATION');

export function setLibraryNavigation(): LibraryNavigation {
	return setContext(LIBRARY_NAVIGATION_KEY, new LibraryNavigation());
}

export function getLibraryNavigation(): LibraryNavigation {
	return getContext<LibraryNavigation>(LIBRARY_NAVIGATION_KEY);
}
