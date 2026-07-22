import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
import type { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
import type { PlantLibrary } from '$lib/state/PlantLibrary.svelte';

export type LibraryType = 'books' | 'music' | 'links' | 'quotes' | 'recipes' | 'movies' | 'games' | 'plants';
export type Library =
	| MusicLibrary
	| BookLibrary
	| LinkLibrary
	| QuoteLibrary
	| RecipeLibrary
	| MovieLibrary
	| GameLibrary
	| PlantLibrary;
export type LibraryRecommendationType = 'favorite' | 'unrated' | 'random' | 'new';

export interface LibraryRecommendation {
	id?: string | null;
	creator: string;
	title: string;
	genre: string;
	cover?: string | null;
	link?: string | null;
}

export interface LibraryConfig {
	type: LibraryType;
	hasCovers: boolean;
	hasRatings: boolean;
	hasViewSwitcher: boolean;
	hasFilters: boolean;
	hasGenres: boolean;
	hasRecommender: boolean;
	hasWishlist: boolean;
	hasExternalLinks: boolean;
	hasReleases: boolean;
	hasShelf: boolean;
	entriesAreLinks: boolean;
}
