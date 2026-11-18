import { describe, it, expect } from 'vitest';
import NoteSearchService from '$lib/services/NoteSearchService';
import type { Note } from '$lib/types/note';

const service = new NoteSearchService();

function note(overrides: Partial<Note> = {}): Note {
	return {
		id: '1',
		title: 'Note',
		content: '',
		category_id: null,
		tags: [],
		is_favorite: false,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

describe('search', () => {
	it('returns nothing for an empty or whitespace term', () => {
		const notes = [note({ title: 'Groceries' })];

		expect(service.search(notes, '', 10)).toEqual([]);
		expect(service.search(notes, '   ', 10)).toEqual([]);
	});

	it('matches the title case-insensitively and ignores surrounding whitespace', () => {
		const groceries = note({ id: '1', title: 'Groceries' });
		const notes = [groceries, note({ id: '2', title: 'Ideas' })];

		expect(service.search(notes, '  GROC ', 10)).toEqual([groceries]);
	});

	it('matches the plain-text content', () => {
		const recipe = note({ id: '1', title: 'Recipe', content: '<p>Add <strong>garlic</strong></p>' });
		const notes = [recipe, note({ id: '2', title: 'Other', content: '<p>Nothing</p>' })];

		expect(service.search(notes, 'garlic', 10)).toEqual([recipe]);
	});

	it('does not match tag names or attributes in the content', () => {
		const notes = [note({ content: '<p><strong class="x"><a href="https://link">Hi</a></strong></p>' })];

		expect(service.search(notes, 'strong', 10)).toEqual([]);
		expect(service.search(notes, 'p', 10)).toEqual([]);
		expect(service.search(notes, 'href', 10)).toEqual([]);
	});

	it('does not join words across block boundaries', () => {
		const notes = [note({ content: '<p>foo</p><p>bar</p>' })];

		expect(service.search(notes, 'foobar', 10)).toEqual([]);
	});

	it('decodes common entities in the content', () => {
		const matching = note({ content: '<p>Tom &amp; Jerry&nbsp;show</p>' });

		expect(service.search([matching], 'tom & jerry show', 10)).toEqual([matching]);
		expect(service.search([matching], 'amp', 10)).toEqual([]);
	});

	it('lists title matches before content-only matches', () => {
		const contentOnly = note({ id: '1', title: 'Shopping', content: '<p>buy milk</p>' });
		const titleMatch = note({ id: '2', title: 'Milk prices', content: '' });
		const both = note({ id: '3', title: 'Milk recipes', content: '<p>milk</p>' });

		expect(service.search([contentOnly, titleMatch, both], 'milk', 10)).toEqual([titleMatch, both, contentOnly]);
	});

	it('caps the result at the limit', () => {
		const notes = [note({ id: '1', title: 'a1' }), note({ id: '2', title: 'a2' }), note({ id: '3', title: 'a3' })];

		expect(service.search(notes, 'a', 2)).toEqual([notes[0], notes[1]]);
	});
});
