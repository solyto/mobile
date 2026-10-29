import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
import type { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
import type { PlantLibrary } from '$lib/state/PlantLibrary.svelte';
import type { Music } from '$lib/types/library_music';
import type { Book } from '$lib/types/library_book';
import type { Quote } from '$lib/types/library_quote';
import type { Recipe } from '$lib/types/library_recipe';
import type { Movie } from '$lib/types/library_movie';
import type { Game } from '$lib/types/library_game';
import type { Plant } from '$lib/types/library_plant';

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
export type GenreLibrary = MusicLibrary | BookLibrary | GameLibrary | MovieLibrary;
export type RatingLibrary = GenreLibrary | RecipeLibrary;
export type FilterLibrary = RatingLibrary | PlantLibrary;
export type LibraryEntry = Music | Book | Quote | Recipe | Movie | Game | Plant;
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
