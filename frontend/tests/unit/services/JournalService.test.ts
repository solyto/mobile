import { describe, it, expect } from 'vitest';
import JournalService from '$lib/services/JournalService';
import type { Note, NoteCategory } from '$lib/types/note';

function category(id: number, overrides: Partial<NoteCategory> = {}): NoteCategory {
	return {
		id,
		title: 'Category',
		parent_id: null,
		sort_order: 0,
		is_system: false,
		is_hidden: false,
		created_at: '',
		updated_at: '',
		children: [],
		...overrides
	};
}

function note(overrides: Partial<Note> = {}): Note {
	return {
		id: 'n1',
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

const service = new JournalService();

describe('findJournalCategory', () => {
	it('finds a root-level system category', () => {
		const journal = category(3, { title: '.journal', is_system: true, is_hidden: true });
		expect(service.findJournalCategory([category(1), journal, category(2)])).toBe(journal);
	});

	it('finds a system category nested as a child', () => {
		const journal = category(9, { is_system: true });
		const parent = category(1, { children: [category(2), journal] });
		expect(service.findJournalCategory([parent])).toBe(journal);
	});

	it('returns null when no category is a system folder', () => {
		expect(service.findJournalCategory([category(1), category(2)])).toBeNull();
	});

	it('returns null for an empty list', () => {
		expect(service.findJournalCategory([])).toBeNull();
	});
});

describe('mergeCategories', () => {
	it('adds a hidden root category as a root', () => {
		const journal = category(3, { title: '.journal', is_system: true, is_hidden: true });
		const merged = service.mergeCategories([category(1), category(2)], [journal]);
		expect(merged.map((c) => c.id)).toEqual([1, 2, 3]);
		expect(merged[2]).toBe(journal);
	});

	it('grafts a hidden category under its visible parent', () => {
		const hidden = category(5, { parent_id: 2, is_hidden: true });
		const merged = service.mergeCategories([category(1), category(2)], [hidden]);
		expect(merged.map((c) => c.id)).toEqual([1, 2]);
		expect(merged[1].children).toEqual([hidden]);
	});

	it('grafts a hidden category under a nested visible parent', () => {
		const hidden = category(7, { parent_id: 4, is_hidden: true });
		const visible = [category(1, { children: [category(4, { parent_id: 1 })] })];
		const merged = service.mergeCategories(visible, [hidden]);
		expect(merged[0].children[0].children).toEqual([hidden]);
	});

	it('keeps the children of a hidden category nested under it', () => {
		const child = category(6, { parent_id: 5 });
		const hidden = category(5, { is_hidden: true, children: [child] });
		const merged = service.mergeCategories([category(1)], [hidden]);
		expect(merged[1].children).toEqual([child]);
	});

	it('falls back to a root when the parent is unknown', () => {
		const hidden = category(5, { parent_id: 99, is_hidden: true });
		const merged = service.mergeCategories([category(1)], [hidden]);
		expect(merged.map((c) => c.id)).toEqual([1, 5]);
	});

	it('finds the journal in the merged tree', () => {
		const journal = category(3, { title: '.journal', is_system: true, is_hidden: true });
		const merged = service.mergeCategories([category(1)], [journal]);
		expect(service.findJournalCategory(merged)).toBe(journal);
	});

	it('does not mutate its inputs', () => {
		const visible = [category(1, { children: [category(4, { parent_id: 1 })] })];
		const hidden = [category(7, { parent_id: 4, is_hidden: true })];
		const before = structuredClone(visible);
		service.mergeCategories(visible, hidden);
		expect(visible).toEqual(before);
		expect(hidden).toHaveLength(1);
	});

	it('returns a copy of the visible tree when nothing is hidden', () => {
		const visible = [category(1)];
		const merged = service.mergeCategories(visible, []);
		expect(merged).toEqual(visible);
		expect(merged).not.toBe(visible);
	});
});

describe('getEntryTitle', () => {
	it('formats a date as YYYY-MM-DD', () => {
		expect(service.getEntryTitle(new Date(2026, 7, 4))).toBe('2026-08-04');
	});

	it('pads single-digit months and days', () => {
		expect(service.getEntryTitle(new Date(2026, 0, 9))).toBe('2026-01-09');
	});
});

describe('isEntryTitle', () => {
	it('accepts date titles', () => {
		expect(service.isEntryTitle('2026-08-04')).toBe(true);
	});

	it('rejects non-date titles', () => {
		expect(service.isEntryTitle('My day')).toBe(false);
		expect(service.isEntryTitle('2026-8-4')).toBe(false);
		expect(service.isEntryTitle('')).toBe(false);
	});
});

describe('parseEntryTitle', () => {
	it('parses a date title into a local date', () => {
		const parsed = service.parseEntryTitle('2026-08-04');
		expect(parsed?.getFullYear()).toBe(2026);
		expect(parsed?.getMonth()).toBe(7);
		expect(parsed?.getDate()).toBe(4);
	});

	it('returns null for non-date titles', () => {
		expect(service.parseEntryTitle('My day')).toBeNull();
		expect(service.parseEntryTitle('2026-8-4')).toBeNull();
		expect(service.parseEntryTitle('')).toBeNull();
	});

	it('round-trips with getEntryTitle', () => {
		const date = new Date(2026, 0, 9);
		expect(service.parseEntryTitle(service.getEntryTitle(date))?.getTime()).toBe(
			date.getTime()
		);
	});
});

describe('findEntry', () => {
	it('finds the entry in the journal folder for the date', () => {
		const notes = [
			note({ id: 'a', title: '2026-08-04', category_id: 7 }),
			note({ id: 'b', title: '2026-08-03', category_id: 7 })
		];
		expect(service.findEntry(notes, 7, new Date(2026, 7, 4))?.id).toBe('a');
	});

	it('ignores a matching title in an ordinary folder', () => {
		const notes = [note({ id: 'a', title: '2026-08-04', category_id: 2 })];
		expect(service.findEntry(notes, 7, new Date(2026, 7, 4))).toBeNull();
	});

	it('returns null when no entry exists for the day', () => {
		expect(service.findEntry([], 7, new Date(2026, 7, 4))).toBeNull();
	});
});

describe('getEntryDates', () => {
	it('returns the date titles of entries in the journal folder', () => {
		const notes = [
			note({ id: 'a', title: '2026-08-04', category_id: 7 }),
			note({ id: 'b', title: '2026-08-02', category_id: 7 }),
			note({ id: 'c', title: 'Not a date', category_id: 7 }),
			note({ id: 'd', title: '2026-08-01', category_id: 2 })
		];
		expect(service.getEntryDates(notes, 7)).toEqual(['2026-08-04', '2026-08-02']);
	});

	it('returns an empty list when the folder has no entries', () => {
		expect(service.getEntryDates([], 7)).toEqual([]);
	});
});

describe('isReachable', () => {
	const today = new Date(2026, 7, 4);

	it('allows today', () => {
		expect(service.isReachable(new Date(2026, 7, 4), today)).toBe(true);
	});

	it('allows earlier days', () => {
		expect(service.isReachable(new Date(2026, 7, 1), today)).toBe(true);
	});

	it('rejects future days', () => {
		expect(service.isReachable(new Date(2026, 7, 5), today)).toBe(false);
	});

	it('compares by day, ignoring the time of day', () => {
		const lateToday = new Date(2026, 7, 4, 23, 59);
		expect(service.isReachable(lateToday, new Date(2026, 7, 4, 0, 1))).toBe(true);
	});
});

describe('hasContent', () => {
	it('rejects an empty string', () => {
		expect(service.hasContent('')).toBe(false);
	});

	it('rejects the editor empty paragraph and line-break variants', () => {
		expect(service.hasContent('<p></p>')).toBe(false);
		expect(service.hasContent('<p><br></p>')).toBe(false);
		expect(service.hasContent('<p>   </p>')).toBe(false);
		expect(service.hasContent('<p>&nbsp;</p>')).toBe(false);
	});

	it('accepts visible text', () => {
		expect(service.hasContent('<p>Hello</p>')).toBe(true);
		expect(service.hasContent('<p><strong>Hi</strong> there</p>')).toBe(true);
	});

	it('accepts content with only embedded media', () => {
		expect(service.hasContent('<p></p><img src="x.png">')).toBe(true);
		expect(service.hasContent('<hr>')).toBe(true);
	});
});
