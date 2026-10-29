import { describe, it, expect, beforeEach } from 'vitest';
import { BookLibrary } from '$lib/state/BookLibrary.svelte';
import { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
import { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
import { GameLibrary } from '$lib/state/GameLibrary.svelte';
import { PlantLibrary } from '$lib/state/PlantLibrary.svelte';
import { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
import { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
import { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import type { Book, BookGenre } from '$lib/types/library_book';
import type { Music, MusicGenre } from '$lib/types/library_music';
import type { Movie, MovieGenre } from '$lib/types/library_movie';
import type { Game, GameGenre } from '$lib/types/library_game';
import type { Plant, PlantLocation } from '$lib/types/library_plant';
import type { Quote } from '$lib/types/library_quote';
import type { Recipe, RecipeType } from '$lib/types/library_recipe';
import type { Link, LinkCategory } from '$lib/types/library_link';

function book(overrides: Partial<Book> = {}): Book {
	return {
		id: 'b1',
		title: 'Book',
		author: 'Author',
		series: null,
		volume: null,
		pages: null,
		current_page: null,
		lent_to: null,
		is_where: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		summary: null,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function music(overrides: Partial<Music> = {}): Music {
	return {
		id: 'm1',
		title: 'Album',
		artist: 'Artist',
		type: null,
		format: null,
		condition: null,
		acquired_where: null,
		additional_info: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		genres: [],
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function movie(overrides: Partial<Movie> = {}): Movie {
	return {
		id: 'mo1',
		title: 'Movie',
		category: '',
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function game(overrides: Partial<Game> = {}): Game {
	return {
		id: 'g1',
		title: 'Game',
		platform: 'PC',
		developer: null,
		publisher: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		playtime_hours: null,
		completed: false,
		wishlist: false,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function plant(overrides: Partial<Plant> = {}): Plant {
	return {
		id: 'p1',
		name: 'Monstera',
		latin_name: 'Monstera deliciosa',
		location: null,
		sunlight: null,
		current_size: null,
		max_size: null,
		acquired_at: null,
		winter_hardy: null,
		instructions: null,
		cover: null,
		link: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function quote(overrides: Partial<Quote> = {}): Quote {
	return {
		id: 'q1',
		summary: null,
		author: 'Author',
		quote: 'Words',
		source: null,
		tags: [],
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function recipe(overrides: Partial<Recipe> = {}): Recipe {
	return {
		id: 'r1',
		title: 'Recipe',
		cover: null,
		link: null,
		rating: null,
		calories: null,
		time_to_make: null,
		servings: null,
		ingredients: [],
		steps: [],
		description: null,
		type: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function link(overrides: Partial<Link> = {}): Link {
	return {
		id: 'l1',
		title: 'Link',
		url: 'https://example.com',
		cover: null,
		tags: [],
		category: null,
		is_favorite: false,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function linkCategory(id: number, title: string): LinkCategory {
	return { id, title, color: null };
}

const genre = (id: number, title: string): BookGenre & MusicGenre & MovieGenre & GameGenre => ({
	id,
	title,
	created_at: '',
	updated_at: ''
});

beforeEach(() => {
	resetStoreMocks();
});

describe('BookLibrary', () => {
	const fantasy = genre(1, 'Fantasy');

	it('loads entries and mirrors them into filteredEntries', async () => {
		api.list.mockResolvedValue({ data: [book({ title: 'Dune' })] });
		const s = new BookLibrary();
		await s.load();
		expect(s.entries).toHaveLength(1);
		expect(s.filteredEntries).toHaveLength(1);
		expect(s.loaded).toBe(true);
	});

	it('searches title, author and series and resets genre/rating filters', () => {
		const s = new BookLibrary();
		s.entries = [
			book({ title: 'The Hobbit', author: 'Tolkien' }),
			book({ title: 'Dune', author: 'Herbert', series: 'Dune Saga' })
		];
		s.genreFilter = fantasy;
		s.ratingFilter = 5;
		s.searchTerm = 'dune';
		s.search();
		expect(s.filteredEntries.map((b) => b.title)).toEqual(['Dune']);
		expect(s.genreFilter).toBeNull();
		expect(s.ratingFilter).toBeNull();
	});

	it('filters by genre and rating together', () => {
		const scifi = genre(2, 'Sci-Fi');
		const s = new BookLibrary();
		s.entries = [
			book({ id: '1', genres: [fantasy], rating: 5 }),
			book({ id: '2', genres: [fantasy], rating: 3 }),
			book({ id: '3', genres: [scifi], rating: 5 })
		];
		s.addGenreFilter(fantasy);
		expect(s.filteredEntries.map((b) => b.id)).toEqual(['1', '2']);
		s.addRatingFilter(5);
		expect(s.filteredEntries.map((b) => b.id)).toEqual(['1']);
	});

	it('filters by wishlist and by lent', () => {
		const s = new BookLibrary();
		s.entries = [
			book({ id: '1', wishlist: true }),
			book({ id: '2', wishlist: false }),
			book({ id: '3', lent_to: 'Alice' })
		];
		s.filterByWishlist();
		expect(s.filteredEntries.map((b) => b.id)).toEqual(['1']);
		expect(s.wishlistFilter).toBe(true);

		s.filterByLent();
		expect(s.filteredEntries.map((b) => b.id)).toEqual(['3']);
		expect(s.lentFilter).toBe(true);
		expect(s.wishlistFilter).toBe(false);
	});

	it('clearFilters restores all entries', () => {
		const s = new BookLibrary();
		s.entries = [book({ id: '1' }), book({ id: '2', wishlist: true })];
		s.filterByWishlist();
		s.clearFilters();
		expect(s.filteredEntries).toHaveLength(2);
		expect(s.wishlistFilter).toBe(false);
		expect(s.lentFilter).toBe(false);
		expect(s.genreFilter).toBeNull();
		expect(s.ratingFilter).toBeNull();
	});

	it('moves the shelf back to the first entry whenever the list is refiltered', async () => {
		const s = new BookLibrary();
		s.entries = [book({ id: '1' }), book({ id: '2' })];
		const actions = [
			() => s.search(),
			() => s.filterByGenreAndRating(),
			() => s.filterByWishlist(),
			() => s.filterByLent(),
			() => s.clearFilters()
		];

		for (const action of actions) {
			s.shelfIndex = 1;
			await action();
			expect(s.shelfIndex).toBe(0);
		}
	});

	it('keeps the last applied filter when the list is reloaded', async () => {
		const entries = [
			book({ id: '1', title: 'Dune', genres: [fantasy], rating: 5, wishlist: true }),
			book({ id: '2', title: 'Hobbit', genres: [fantasy], rating: 3, lent_to: 'Alice' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new BookLibrary();
		const searchFor = (term: string) => {
			s.searchTerm = term;
			s.search();
		};
		const filters = [
			{ apply: () => searchFor('dune'), ids: ['1'] },
			{ apply: () => s.addRatingFilter(3), ids: ['2'] },
			{ apply: () => s.filterByWishlist(), ids: ['1'] },
			{ apply: () => s.filterByLent(), ids: ['2'] },
			{ apply: () => s.clearFilters(), ids: ['1', '2'] }
		];

		for (const filter of filters) {
			s.entries = entries;
			filter.apply();
			await s.load();
			expect(s.filteredEntries.map((b) => b.id)).toEqual(filter.ids);
		}
	});

	it('keeps the shelf position on reload and clamps it to the list', async () => {
		const s = new BookLibrary();
		api.list.mockResolvedValue({ data: [book({ id: '1' }), book({ id: '2' })] });
		s.shelfIndex = 1;
		await s.load();
		expect(s.shelfIndex).toBe(1);

		api.list.mockResolvedValue({ data: [book({ id: '1' })] });
		await s.load();
		expect(s.shelfIndex).toBe(0);
	});

	it('restores the persisted view and switches between views', () => {
		storage.get.mockReturnValue('list');
		const s = new BookLibrary();
		expect(s.view).toBe('list');

		s.switchView();
		expect(s.view).toBe('cards');
		s.switchView();
		expect(s.view).toBe('shelf');
		s.switchView();
		expect(s.view).toBe('list');
	});

	it('falls back to cards for an invalid persisted view', () => {
		storage.get.mockReturnValue('grid');
		expect(new BookLibrary().view).toBe('cards');

		storage.get.mockReturnValue('');
		expect(new BookLibrary().view).toBe('cards');
	});
});

describe('MusicLibrary', () => {
	it('searches title and artist', () => {
		const s = new MusicLibrary();
		s.entries = [
			music({ title: 'Abbey Road', artist: 'The Beatles' }),
			music({ title: 'Revolver', artist: 'The Beatles' })
		];
		s.searchTerm = 'beatles';
		s.search();
		expect(s.filteredEntries).toHaveLength(2);

		s.searchTerm = 'abbey';
		s.search();
		expect(s.filteredEntries.map((m) => m.title)).toEqual(['Abbey Road']);
	});

	it('filters by genre and rating and wishlist', () => {
		const rock = genre(1, 'Rock');
		const s = new MusicLibrary();
		s.entries = [
			music({ id: '1', genres: [rock], rating: 5 }),
			music({ id: '2', genres: [rock], rating: 2, wishlist: true }),
			music({ id: '3', genres: [], rating: 5 })
		];
		s.filterByGenreAndRating();
		expect(s.filteredEntries).toHaveLength(3);

		s.addGenreFilter(rock);
		s.addRatingFilter(5);
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['1']);

		s.clearFilters();
		s.filterByWishlist();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['2']);
	});

	it('moves the shelf back to the first entry whenever the list is refiltered', async () => {
		const s = new MusicLibrary();
		s.entries = [music({ id: '1' }), music({ id: '2' })];
		const actions = [
			() => s.search(),
			() => s.filterByGenreAndRating(),
			() => s.filterByWishlist(),
			() => s.clearFilters()
		];

		for (const action of actions) {
			s.shelfIndex = 1;
			await action();
			expect(s.shelfIndex).toBe(0);
		}
	});

	it('keeps the last applied filter and shelf position when the list is reloaded', async () => {
		const entries = [
			music({ id: '1', title: 'Abbey Road', rating: 5 }),
			music({ id: '2', title: 'Revolver', wishlist: true }),
			music({ id: '3', title: 'Help' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new MusicLibrary();
		s.entries = entries;
		s.filterByWishlist();
		await s.load();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['2']);

		s.searchTerm = 'e';
		s.search();
		s.shelfIndex = 2;
		await s.load();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['1', '2', '3']);
		expect(s.shelfIndex).toBe(2);
	});

	it('restores the persisted view', () => {
		storage.get.mockReturnValue('spine');
		const s = new MusicLibrary();
		expect(s.view).toBe('spine');
	});

	it('falls back to cards for an invalid persisted view', () => {
		storage.get.mockReturnValue('grid');
		expect(new MusicLibrary().view).toBe('cards');

		storage.get.mockReturnValue('');
		expect(new MusicLibrary().view).toBe('cards');
	});
});

describe('MovieLibrary', () => {
	it('searches the title only', () => {
		const s = new MovieLibrary();
		s.entries = [movie({ title: 'Inception' }), movie({ title: 'Interstellar' })];
		s.searchTerm = 'in';
		s.search();
		expect(s.filteredEntries).toHaveLength(2);

		s.searchTerm = 'inception';
		s.search();
		expect(s.filteredEntries.map((m) => m.title)).toEqual(['Inception']);
	});

	it('filters by genre/rating and wishlist', () => {
		const scifi = genre(1, 'Sci-Fi');
		const s = new MovieLibrary();
		s.entries = [
			movie({ id: '1', genres: [scifi], rating: 4 }),
			movie({ id: '2', genres: [scifi], rating: 4, wishlist: true }),
			movie({ id: '3', genres: [], rating: 4 })
		];
		s.addGenreFilter(scifi);
		s.addRatingFilter(4);
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['1', '2']);

		s.clearFilters();
		expect(s.filteredEntries).toHaveLength(3);

		s.filterByWishlist();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['2']);
	});

	it('keeps the last applied filter when the list is reloaded', async () => {
		const entries = [
			movie({ id: '1', title: 'Inception', rating: 5 }),
			movie({ id: '2', title: 'Heat' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new MovieLibrary();
		s.entries = entries;
		s.addRatingFilter(5);
		await s.load();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['1']);

		s.searchTerm = 'heat';
		s.search();
		await s.load();
		expect(s.filteredEntries.map((m) => m.id)).toEqual(['2']);
	});

	it('toggles between list and cards view', () => {
		const s = new MovieLibrary();
		expect(s.view).toBe('cards');
		s.switchView();
		expect(s.view).toBe('list');
		s.switchView();
		expect(s.view).toBe('cards');
	});
});

describe('GameLibrary', () => {
	it('searches title, developer and publisher', () => {
		const s = new GameLibrary();
		s.entries = [
			game({ title: 'Hades', developer: 'Supergiant' }),
			game({ title: 'Bastion', developer: 'Supergiant', publisher: 'Warner' })
		];
		s.searchTerm = 'supergiant';
		s.search();
		expect(s.filteredEntries).toHaveLength(2);

		s.searchTerm = 'warner';
		s.search();
		expect(s.filteredEntries.map((g) => g.title)).toEqual(['Bastion']);
	});

	it('filters by genre, rating and wishlist', () => {
		const rpg = genre(1, 'RPG');
		const s = new GameLibrary();
		s.entries = [
			game({ id: '1', genres: [rpg], rating: 5 }),
			game({ id: '2', genres: [rpg], rating: 5, wishlist: true }),
			game({ id: '3', genres: [], rating: 5 })
		];
		s.addGenreFilter(rpg);
		s.addRatingFilter(5);
		expect(s.filteredEntries.map((g) => g.id)).toEqual(['1', '2']);

		s.clearFilters();
		s.filterByWishlist();
		expect(s.filteredEntries.map((g) => g.id)).toEqual(['2']);
	});

	it('keeps the last applied filter when the list is reloaded', async () => {
		const entries = [
			game({ id: '1', title: 'Hades', wishlist: true }),
			game({ id: '2', title: 'Bastion' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new GameLibrary();
		s.entries = entries;
		s.filterByWishlist();
		await s.load();
		expect(s.filteredEntries.map((g) => g.id)).toEqual(['1']);

		s.searchTerm = 'bastion';
		s.search();
		await s.load();
		expect(s.filteredEntries.map((g) => g.id)).toEqual(['2']);
	});

	it('toggles between list and cards view', () => {
		const s = new GameLibrary();
		s.switchView();
		expect(s.view).toBe('list');
		s.switchView();
		expect(s.view).toBe('cards');
	});
});

describe('PlantLibrary', () => {
	it('searches name and latin name', () => {
		const s = new PlantLibrary();
		s.entries = [
			plant({ name: 'Monstera', latin_name: 'Monstera deliciosa' }),
			plant({ name: 'Ficus', latin_name: 'Ficus lyrata' })
		];
		s.searchTerm = 'monstera';
		s.search();
		expect(s.filteredEntries).toHaveLength(1);

		s.searchTerm = 'lyrata';
		s.search();
		expect(s.filteredEntries.map((p) => p.name)).toEqual(['Ficus']);
	});

	it('filters by location and by unidentified', () => {
		const s = new PlantLibrary();
		s.entries = [
			plant({ id: '1', location: 'indoor' }),
			plant({ id: '2', location: 'outdoor' }),
			plant({ id: '3', name: null, latin_name: null, location: 'indoor' })
		];

		s.addLocationFilter('indoor' as PlantLocation);
		expect(s.filteredEntries.map((p) => p.id)).toEqual(['1', '3']);

		s.filterByUnidentified();
		expect(s.filteredEntries.map((p) => p.id)).toEqual(['3']);
		expect(s.unidentifiedFilter).toBe(true);
		expect(s.locationFilter).toBeNull();

		s.clearFilters();
		expect(s.filteredEntries).toHaveLength(3);
	});

	it('keeps the last applied filter when the list is reloaded', async () => {
		const entries = [
			plant({ id: '1', name: 'Monstera', location: 'indoor' }),
			plant({ id: '2', name: null, latin_name: null }),
			plant({ id: '3', name: 'Ficus' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new PlantLibrary();
		const searchFor = (term: string) => {
			s.searchTerm = term;
			s.search();
		};
		s.entries = entries;
		const filters = [
			{ apply: () => searchFor('ficus'), ids: ['3'] },
			{ apply: () => s.addLocationFilter('indoor' as PlantLocation), ids: ['1'] },
			{ apply: () => s.filterByUnidentified(), ids: ['2'] },
			{ apply: () => s.clearFilters(), ids: ['1', '2', '3'] }
		];

		for (const filter of filters) {
			filter.apply();
			await s.load();
			expect(s.filteredEntries.map((p) => p.id)).toEqual(filter.ids);
		}
	});

	it('toggles between list and cards view', () => {
		const s = new PlantLibrary();
		s.switchView();
		expect(s.view).toBe('list');
		s.switchView();
		expect(s.view).toBe('cards');
	});
});

describe('QuoteLibrary', () => {
	it('searches author and quote', () => {
		const s = new QuoteLibrary();
		s.entries = [
			quote({ author: 'Nietzsche', quote: 'What does not kill me' }),
			quote({ author: 'Goethe', quote: 'Know thyself' })
		];
		s.searchTerm = 'kill';
		s.search();
		expect(s.filteredEntries.map((q) => q.author)).toEqual(['Nietzsche']);

		s.searchTerm = 'GOETHE';
		s.search();
		expect(s.filteredEntries.map((q) => q.author)).toEqual(['Goethe']);
	});

	it('keeps the search when the list is reloaded', async () => {
		api.list.mockResolvedValue({
			data: [quote({ id: '1', author: 'Goethe' }), quote({ id: '2' })]
		});
		const s = new QuoteLibrary();
		s.searchTerm = 'goethe';
		await s.load();
		expect(s.filteredEntries.map((q) => q.id)).toEqual(['1']);
	});
});

describe('RecipeLibrary', () => {
	it('searches title and ingredients', () => {
		const s = new RecipeLibrary();
		s.entries = [
			recipe({
				title: 'Spaghetti',
				ingredients: [{ name: 'Tomato', amount: 2, unit: null }]
			}),
			recipe({ title: 'Pizza', ingredients: [{ name: 'Flour', amount: 1, unit: 'kg' }] })
		];
		s.searchTerm = 'tomato';
		s.search();
		expect(s.filteredEntries.map((r) => r.title)).toEqual(['Spaghetti']);

		s.searchTerm = '';
		s.search();
		expect(s.filteredEntries).toHaveLength(2);
	});

	it('filters by rating and type', () => {
		const s = new RecipeLibrary();
		s.entries = [
			recipe({ id: '1', rating: 5, type: 'dinner' }),
			recipe({ id: '2', rating: 3, type: 'dinner' }),
			recipe({ id: '3', rating: 5, type: 'dessert' })
		];
		s.addRatingFilter(5);
		expect(s.filteredEntries.map((r) => r.id)).toEqual(['1', '3']);

		s.addTypeFilter('dinner' as RecipeType);
		expect(s.filteredEntries.map((r) => r.id)).toEqual(['1']);

		s.clearFilters();
		expect(s.filteredEntries).toHaveLength(3);
		expect(s.ratingFilter).toBeNull();
		expect(s.typeFilter).toBeNull();
	});

	it('keeps the last applied filter when the list is reloaded', async () => {
		const entries = [
			recipe({ id: '1', title: 'Pizza', rating: 5, type: 'dinner' }),
			recipe({ id: '2', title: 'Cake', rating: 5, type: 'dessert' })
		];
		api.list.mockResolvedValue({ data: entries });
		const s = new RecipeLibrary();
		s.entries = entries;
		s.addTypeFilter('dessert' as RecipeType);
		await s.load();
		expect(s.filteredEntries.map((r) => r.id)).toEqual(['2']);

		s.searchTerm = 'pizza';
		s.search();
		await s.load();
		expect(s.filteredEntries.map((r) => r.id)).toEqual(['1']);
	});

	it('toggles between list and cards view', () => {
		const s = new RecipeLibrary();
		s.switchView();
		expect(s.view).toBe('list');
		s.switchView();
		expect(s.view).toBe('cards');
	});
});

describe('LinkLibrary', () => {
	it('searches title and url', () => {
		const s = new LinkLibrary();
		s.entries = [
			link({ title: 'Solyto', url: 'https://solyto.app' }),
			link({ title: 'Docs', url: 'https://docs.example.com' })
		];
		s.searchTerm = 'solyto';
		s.search();
		expect(s.filteredEntries).toHaveLength(1);
	});

	it('loads categories and computes per-category counts', async () => {
		const work = linkCategory(1, 'Work');
		const s = new LinkLibrary();
		s.entries = [
			link({ id: '1', category: work }),
			link({ id: '2', category: work }),
			link({ id: '3', category: null })
		];
		api.list.mockResolvedValue({ data: [work, linkCategory(2, 'Private')] });

		await s.loadCategories();

		expect(s.categoriesCount).toEqual([
			{ id: 1, count: 2 },
			{ id: 2, count: 0 }
		]);
		expect(s.getCategoryCount(1)).toBe(2);
		expect(s.getCategoryCount(2)).toBe(0);
		expect(s.getCategoryCount(null)).toBe(1); // uncategorised
		expect(s.getCategoryCount(undefined)).toBe(3); // all entries
	});

	it('counts favourites', () => {
		const s = new LinkLibrary();
		s.entries = [link({ id: '1', is_favorite: true }), link({ id: '2', is_favorite: false })];
		expect(s.getFavoriteCount()).toBe(1);
	});

	it('filters by category including the uncategorised bucket', () => {
		const work = linkCategory(1, 'Work');
		const s = new LinkLibrary();
		s.entries = [
			link({ id: '1', category: work }),
			link({ id: '2', category: null }),
			link({ id: '3', category: work })
		];

		s.filterByCategory(1);
		expect(s.filteredEntries.map((l) => l.id)).toEqual(['1', '3']);

		s.filterByCategory(0); // uncategorised
		expect(s.filteredEntries.map((l) => l.id)).toEqual(['2']);

		s.filterByCategory(null); // all
		expect(s.filteredEntries).toHaveLength(3);
	});

	it('filters by favourite', () => {
		const s = new LinkLibrary();
		s.entries = [link({ id: '1', is_favorite: true }), link({ id: '2', is_favorite: false })];
		s.filterByFavorite();
		expect(s.activeFilter).toBe('favorite');
		expect(s.filteredEntries.map((l) => l.id)).toEqual(['1']);
	});

	it('reapplies the active filter after a reload', async () => {
		const work = linkCategory(1, 'Work');
		const s = new LinkLibrary();
		s.entries = [link({ id: '1', category: work }), link({ id: '2', category: null })];
		s.filterByCategory(1);
		expect(s.filteredEntries).toHaveLength(1);

		s.reapplyFilter();
		expect(s.filteredEntries).toHaveLength(1);

		s.filterByFavorite();
		s.reapplyFilter();
		expect(s.activeFilter).toBe('favorite');
	});

	it('keeps the search after a reload until a category is chosen', () => {
		const work = linkCategory(1, 'Work');
		const s = new LinkLibrary();
		s.entries = [
			link({ id: '1', title: 'Solyto', category: work }),
			link({ id: '2', title: 'Docs', category: work })
		];
		s.filterByCategory(1);
		s.searchTerm = 'solyto';
		s.search();

		s.reapplyFilter();
		expect(s.filteredEntries.map((l) => l.id)).toEqual(['1']);

		s.filterByCategory(1);
		s.reapplyFilter();
		expect(s.filteredEntries.map((l) => l.id)).toEqual(['1', '2']);
	});

	it('resolves the active category id for new entries', () => {
		const s = new LinkLibrary();

		expect(s.getActiveCategoryId()).toBeNull(); // "All"

		s.filterByCategory(3);
		expect(s.getActiveCategoryId()).toBe(3);

		s.filterByCategory(0); // uncategorised
		expect(s.getActiveCategoryId()).toBeNull();

		s.filterByFavorite();
		expect(s.getActiveCategoryId()).toBeNull();
	});
});
