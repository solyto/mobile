import { describe, it, expect } from 'vitest';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { Book, BookGenre } from '$lib/types/library_book';
import type { Plant, PlantLocation } from '$lib/types/library_plant';
import type { Recipe, RecipeType } from '$lib/types/library_recipe';

const service = new LibraryFilterService();

function book(overrides: Partial<Book> = {}): Book {
	return {
		id: 1,
		title: 'Book',
		genres: [],
		rating: null,
		wishlist: false,
		lent_to: null,
		author: 'Author',
		created_at: '',
		updated_at: '',
		...overrides
	} as Book;
}

describe('search', () => {
	const entries = [
		book({ title: 'The Hobbit', author: 'Tolkien' }),
		book({ title: 'Dune', author: 'Herbert' })
	];

	it('returns everything for an empty search term', () => {
		expect(service.search(entries, '', ['title'])).toHaveLength(2);
	});

	it('matches case-insensitively on the given fields', () => {
		expect(service.search(entries, 'hobbit', ['title'])).toHaveLength(1);
		expect(service.search(entries, 'HERBERT', ['author'])).toHaveLength(1);
	});

	it('matches when any field matches', () => {
		expect(service.search(entries, 'Dune', ['title', 'author'])).toHaveLength(1);
	});

	it('returns an empty array when nothing matches', () => {
		expect(service.search(entries, 'zzz', ['title'])).toHaveLength(0);
	});
});

describe('byRating', () => {
	it('returns everything when rating is null', () => {
		const entries = [book({ rating: 5 }), book({ rating: 3 })];
		expect(service.byRating(entries, null)).toHaveLength(2);
	});

	it('filters by exact rating', () => {
		const entries = [book({ rating: 5 }), book({ rating: 3 })];
		expect(service.byRating(entries, 5)).toHaveLength(1);
	});
});

describe('byGenre', () => {
	const fantasy: BookGenre = { id: 1, title: 'Fantasy', created_at: '', updated_at: '' };
	const scifi: BookGenre = { id: 2, title: 'Sci-Fi', created_at: '', updated_at: '' };

	it('returns everything when genre is null', () => {
		const entries = [book({ genres: [fantasy] })];
		expect(service.byGenre(entries, null)).toHaveLength(1);
	});

	it('filters by genre id', () => {
		const entries = [book({ genres: [fantasy] }), book({ genres: [scifi] })];
		expect(service.byGenre(entries, fantasy)).toHaveLength(1);
	});
});

describe('byGenreAndRating', () => {
	const fantasy: BookGenre = { id: 1, title: 'Fantasy', created_at: '', updated_at: '' };

	it('applies rating and genre together', () => {
		const entries = [
			book({ genres: [fantasy], rating: 5 }),
			book({ genres: [fantasy], rating: 3 }),
			book({ genres: [], rating: 5 })
		];
		expect(service.byGenreAndRating(entries, fantasy, 5)).toHaveLength(1);
	});

	it('passes through when both are null', () => {
		expect(service.byGenreAndRating([book()], null, null)).toHaveLength(1);
	});
});

describe('byType', () => {
	const main: RecipeType = 'lunch';

	it('returns everything when type is null', () => {
		const entries = [{ type: 'main' as const }, { type: 'dessert' as const }];
		expect(service.byType(entries as unknown as Recipe[], null)).toHaveLength(2);
	});

	it('filters by recipe type', () => {
		const entries = [{ type: 'lunch' as const }, { type: 'dessert' as const }];
		expect(service.byType(entries as unknown as Recipe[], main)).toHaveLength(1);
	});
});

describe('byLocation', () => {
	const livingroom: PlantLocation = 'indoor';

	it('returns everything when location is null', () => {
		const entries = [{ location: 'livingroom' as const }];
		expect(service.byLocation(entries as unknown as Plant[], null)).toHaveLength(1);
	});

	it('filters by plant location', () => {
		const entries = [{ location: 'indoor' as const }, { location: 'outdoor' as const }];
		expect(service.byLocation(entries as unknown as Plant[], livingroom)).toHaveLength(1);
	});
});

describe('byUnidentified', () => {
	it('keeps only plants without name and latin name', () => {
		const entries = [
			{ name: null, latin_name: null },
			{ name: 'Monstera', latin_name: 'Monstera deliciosa' },
			{ name: null, latin_name: 'Ficus' }
		];
		expect(service.byUnidentified(entries as unknown as Plant[])).toHaveLength(1);
	});
});

describe('byWishlist', () => {
	it('keeps only wishlisted entries', () => {
		const entries = [book({ wishlist: true }), book({ wishlist: false })];
		expect(service.byWishlist(entries)).toHaveLength(1);
	});
});

describe('byLent', () => {
	it('keeps only books that are lent out', () => {
		const entries = [book({ lent_to: 'Alice' }), book({ lent_to: null })];
		expect(service.byLent(entries)).toHaveLength(1);
	});
});
