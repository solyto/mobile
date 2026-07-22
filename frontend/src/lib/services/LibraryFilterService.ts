
import type { Music, MusicGenre } from '$lib/types/library_music';
import type { Book, BookGenre } from '$lib/types/library_book';
import type { Quote } from '$lib/types/library_quote';
import type { Link } from '$lib/types/library_link';
import type { Recipe, RecipeType } from '$lib/types/library_recipe';
import type { Movie, MovieGenre } from '$lib/types/library_movie';
import type { Game } from '$lib/types/library_game';
import type { Plant, PlantLocation } from '$lib/types/library_plant';

export default class LibraryFilterService {
	search<T extends Music | Book | Quote | Link | Recipe | Movie | Game | Plant>(
		entries: T[],
		searchTerm: string,
		fields: string[]
	): T[] {
		if (searchTerm.length === 0) return entries;

		return entries.filter((entry) => {
			return fields.some((field) => {
				return String((entry as any)[field]).toLowerCase().includes(searchTerm.toLowerCase());
			});
		});
	}

	byRating<T extends Music | Book | Recipe | Movie>(entries: T[], rating: number | null): T[] {
		if (rating === null) return entries;

		return entries.filter((entry) => entry.rating === rating);
	}

	byGenre<T extends Music | Book | Movie>(
		entries: T[],
		genre: MusicGenre | BookGenre | MovieGenre | null
	): T[] {
		if (genre === null) return entries;

		return entries.filter((entry) => entry.genres.some((g) => g.id === genre.id));
	}

	byGenreAndRating<T extends Music | Book | Movie | Game | Plant>(
		entries: T[],
		genre: MusicGenre | BookGenre | null,
		rating: number | null
	): T[] {
		return this.byGenre(this.byRating(entries as any, rating), genre as any) as T[];
	}

	byType<T extends Recipe>(entries: T[], type: RecipeType | null): T[] {
		if (type === null) return entries;

		return entries.filter((entry) => entry.type === type);
	}

	byLocation(entries: Plant[], location: PlantLocation | null): Plant[] {
		if (location === null) return entries;
		return entries.filter((entry) => entry.location === location);
	}

	byUnidentified(entries: Plant[]): Plant[] {
		return entries.filter((entry) => entry.name === null && entry.latin_name === null);
	}

	byWishlist<T extends Music | Book | Movie | Game>(entries: T[]): T[] {
		return entries.filter((entry) => entry.wishlist);
	}

	byLent<T extends Book>(entries: T[]): T[] {
		return entries.filter((entry) => entry.lent_to !== null);
	}
}
