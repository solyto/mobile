import { describe, it, expect } from 'vitest';
import NoteLinkService from '$lib/services/NoteLinkService';
import { note } from '../helpers/factories';

const service = new NoteLinkService();
const UUID = '9b2f6c1e-4a7d-4e2b-9f3a-1c2d3e4f5a6b';

describe('noteIdFromHref', () => {
	it('reads the id from an app-relative note path', () => {
		expect(service.noteIdFromHref(`/notes/${UUID}`)).toBe(UUID);
	});

	it('reads the id from an absolute URL on any host', () => {
		expect(service.noteIdFromHref(`https://solyto.app/notes/${UUID}`)).toBe(UUID);
		expect(service.noteIdFromHref(`http://localhost:5173/notes/${UUID}`)).toBe(UUID);
	});

	it('accepts a trailing slash, query or fragment and normalises the case', () => {
		expect(service.noteIdFromHref(`/notes/${UUID}/`)).toBe(UUID);
		expect(service.noteIdFromHref(`/notes/${UUID}?x=1`)).toBe(UUID);
		expect(service.noteIdFromHref(`/notes/${UUID.toUpperCase()}#top`)).toBe(UUID);
	});

	it('returns null for links that are not a single note', () => {
		expect(service.noteIdFromHref('https://example.com')).toBeNull();
		expect(service.noteIdFromHref('/notes')).toBeNull();
		expect(service.noteIdFromHref('/notes/journal')).toBeNull();
		expect(service.noteIdFromHref(`/notes/${UUID}/edit`)).toBeNull();
		expect(service.noteIdFromHref(`/todos/${UUID}`)).toBeNull();
		expect(service.noteIdFromHref(`https://example.com/x/notes/${UUID}`)).toBeNull();
		expect(service.noteIdFromHref(`//evil.example/notes/${UUID}`)).toBeNull();
	});
});

describe('hrefForNote', () => {
	it('builds the app-relative path that noteIdFromHref reads back', () => {
		const href = service.hrefForNote(note({ id: UUID }));

		expect(href).toBe(`/notes/${UUID}`);
		expect(service.noteIdFromHref(href)).toBe(UUID);
	});
});

describe('searchByTitle', () => {
	const groceries = note({ id: '1', title: 'Groceries' });
	const ideas = note({ id: '2', title: 'Ideas', content: '<p>groceries</p>' });
	const notes = [groceries, ideas];

	it('returns all notes up to the limit for an empty term', () => {
		expect(service.searchByTitle(notes, '  ', 10)).toEqual(notes);
		expect(service.searchByTitle(notes, '', 1)).toEqual([groceries]);
	});

	it('matches the title case-insensitively, never the content', () => {
		expect(service.searchByTitle(notes, ' GROC ', 10)).toEqual([groceries]);
	});

	it('returns nothing when no title matches', () => {
		expect(service.searchByTitle(notes, 'xyz', 10)).toEqual([]);
	});
});
