import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotesSvelte } from '$lib/state/Notes.svelte';
import { api, storage, pageState, resetStoreMocks } from '../setup/storeMocks';
import type { Note, NoteCategory } from '$lib/types/note';

const { navigation } = vi.hoisted(() => ({
	navigation: {
		goto: vi.fn(),
		resolve: (path: string, params: Record<string, string>) => path.replace('[id]', params.id)
	}
}));

vi.mock('$app/navigation', () => ({ goto: navigation.goto }));
vi.mock('$app/paths', () => ({ resolve: navigation.resolve }));

function note(overrides: Partial<Note> = {}): Note {
	return {
		id: 'n1',
		title: 'Note',
		content: '',
		category_id: null,
		tags: [],
		is_favorite: false,
		created_at: '2026-01-01T00:00:00',
		updated_at: '2026-01-01T00:00:00',
		...overrides
	};
}

function category(id: number, title: string, overrides: Partial<NoteCategory> = {}): NoteCategory {
	return {
		id,
		title,
		parent_id: null,
		sort_order: 0,
		created_at: '',
		updated_at: '',
		children: [],
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/notes';
	pageState.params = {};
	navigation.goto.mockReset();
	navigation.goto.mockResolvedValue(undefined);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Notes store', () => {
	describe('newest / last updated / favorites', () => {
		it('getNewestNotes returns the five most recently created notes', () => {
			const n = new NotesSvelte();
			n.notes = [
				note({ id: '1', created_at: '2026-01-01T00:00:00' }),
				note({ id: '2', created_at: '2026-03-01T00:00:00' }),
				note({ id: '3', created_at: '2026-02-01T00:00:00' }),
				note({ id: '4', created_at: '2026-05-01T00:00:00' }),
				note({ id: '5', created_at: '2026-04-01T00:00:00' }),
				note({ id: '6', created_at: '2026-06-01T00:00:00' })
			];
			expect(n.getNewestNotes().map((x) => x.id)).toEqual(['6', '4', '5', '2', '3']);
		});

		it('getLastUpdatedNotes returns the five most recently updated notes', () => {
			const n = new NotesSvelte();
			n.notes = [
				note({ id: '1', updated_at: '2026-01-01T00:00:00' }),
				note({ id: '2', updated_at: '2026-03-01T00:00:00' }),
				note({ id: '3', updated_at: '2026-02-01T00:00:00' }),
				note({ id: '4', updated_at: '2026-05-01T00:00:00' }),
				note({ id: '5', updated_at: '2026-04-01T00:00:00' }),
				note({ id: '6', updated_at: '2026-06-01T00:00:00' })
			];
			expect(n.getLastUpdatedNotes().map((x) => x.id)).toEqual(['6', '4', '5', '2', '3']);
		});

		it('getFavorites returns only favourite notes', () => {
			const n = new NotesSvelte();
			n.notes = [
				note({ id: '1', is_favorite: true }),
				note({ id: '2', is_favorite: false }),
				note({ id: '3', is_favorite: true })
			];
			expect(n.getFavorites().map((x) => x.id)).toEqual(['1', '3']);
		});
	});

	describe('categories', () => {
		it('getNotesForCategory filters by category id', () => {
			const n = new NotesSvelte();
			n.notes = [
				note({ id: '1', category_id: 1 }),
				note({ id: '2', category_id: null }),
				note({ id: '3', category_id: 1 })
			];
			expect(n.getNotesForCategory(1).map((x) => x.id)).toEqual(['1', '3']);
			expect(n.getNotesForCategory(null).map((x) => x.id)).toEqual(['2']);
		});

		it('getCategoryTitle resolves top-level categories', () => {
			const n = new NotesSvelte();
			n.categories = [category(1, 'Work'), category(2, 'Private')];
			expect(n.getCategoryTitle(1)).toBe('Work');
		});

		it('getCategoryTitle resolves child categories', () => {
			const n = new NotesSvelte();
			n.categories = [category(1, 'Work', { children: [category(5, 'Projects')] })];
			expect(n.getCategoryTitle(5)).toBe('Projects');
		});

		it('getCategoryTitle returns a dash for unknown categories', () => {
			const n = new NotesSvelte();
			n.categories = [category(1, 'Work')];
			expect(n.getCategoryTitle(99)).toBe('-');
		});
	});

	describe('collapsed categories', () => {
		it('loads persisted collapsed categories from storage', () => {
			storage.getJson.mockReturnValue([1, 2]);
			const n = new NotesSvelte();
			expect(n.collapsedCategories).toEqual([1, 2]);
			expect(storage.getJson).toHaveBeenCalledWith(NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY);
		});

		it('defaults to an empty list when nothing is stored', () => {
			storage.getJson.mockReturnValue(null);
			const n = new NotesSvelte();
			expect(n.collapsedCategories).toEqual([]);
		});

		it('toggleCollapseCategory adds and removes ids and persists', () => {
			const n = new NotesSvelte();
			n.toggleCollapseCategory(3);
			expect(n.isCategoryCollapsed(3)).toBe(true);
			expect(storage.setJson).toHaveBeenCalledWith(NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY, [
				3
			]);

			n.toggleCollapseCategory(3);
			expect(n.isCategoryCollapsed(3)).toBe(false);
			expect(storage.setJson).toHaveBeenCalledWith(
				NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY,
				[]
			);
		});
	});

	describe('active note', () => {
		it('selectNote sets the active note by id', () => {
			const n = new NotesSvelte();
			n.notes = [note({ id: '1' }), note({ id: '2' })];
			n.selectNote('2');
			expect(n.activeNote?.id).toBe('2');
		});

		it('selectNote clears the active note when the id is unknown', () => {
			const n = new NotesSvelte();
			n.notes = [note({ id: '1' })];
			n.selectNote('missing');
			expect(n.activeNote).toBeNull();
		});

		it('checkUrlForActiveNote selects the note from the page params', () => {
			pageState.params = { id: 'n7' };
			const n = new NotesSvelte();
			n.notes = [note({ id: 'n7' }), note({ id: 'n8' })];
			n.checkUrlForActiveNote();
			expect(n.activeNote?.id).toBe('n7');
		});
	});

	describe('create', () => {
		it('does nothing when the input is empty', async () => {
			const n = new NotesSvelte();
			n.inputValue = '';
			await expect(n.create()).resolves.toBeNull();
			expect(api.create).not.toHaveBeenCalled();
		});

		it('creates a note, reloads and navigates to it', async () => {
			api.create.mockResolvedValue({ data: note({ id: 'n9', title: 'Draft' }) });
			api.list.mockResolvedValue({ data: [note({ id: 'n9' })] });

			const n = new NotesSvelte();
			n.inputValue = 'Draft';
			const result = await n.create();

			expect(result?.id).toBe('n9');
			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/notes'), {
				title: 'Draft'
			});
			expect(n.activeNote?.id).toBe('n9');
			expect(n.inputValue).toBe('');
			expect(navigation.goto).toHaveBeenCalledWith('/notes/n9');
		});

		it('passes the parent category id when creating inside a category', async () => {
			api.create.mockResolvedValue({ data: note({ id: 'n10', category_id: 5 }) });

			const n = new NotesSvelte();
			n.inputValue = 'Child';
			n.createParent = 5;
			await n.create();

			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/notes'), {
				title: 'Child',
				category_id: 5
			});
		});

		it('collapses the parent category when it was not collapsed yet', async () => {
			api.create.mockResolvedValue({ data: note({ id: 'n11', category_id: 5 }) });

			const n = new NotesSvelte();
			n.inputValue = 'Child';
			n.createParent = 5;
			await n.create();

			expect(n.isCategoryCollapsed(5)).toBe(true);
			expect(storage.setJson).toHaveBeenCalledWith(NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY, [
				5
			]);
		});

		it('returns null and resets the input when creation fails', async () => {
			api.create.mockResolvedValue(null);

			const n = new NotesSvelte();
			n.inputValue = 'Doomed';
			await expect(n.create()).resolves.toBeNull();
			expect(n.inputValue).toBe('');
			expect(navigation.goto).not.toHaveBeenCalled();
		});
	});

	describe('createCategory', () => {
		it('does nothing when the input is empty', async () => {
			const n = new NotesSvelte();
			n.inputValue = '';
			await expect(n.createCategory()).resolves.toBeNull();
			expect(api.create).not.toHaveBeenCalled();
		});

		it('creates a top-level category', async () => {
			api.create.mockResolvedValue({ data: category(3, 'Ideas') });

			const n = new NotesSvelte();
			n.inputValue = 'Ideas';
			const result = await n.createCategory();

			expect(result?.id).toBe(3);
			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/notes/categories'), {
				title: 'Ideas'
			});
		});

		it('creates a child category with a parent id', async () => {
			api.create.mockResolvedValue({ data: category(4, 'Sub') });

			const n = new NotesSvelte();
			n.inputValue = 'Sub';
			n.createParent = 2;
			await n.createCategory();

			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/notes/categories'), {
				title: 'Sub',
				parent_id: 2
			});
		});

		it('updates an existing category in edit mode', async () => {
			api.update.mockResolvedValue({ data: category(7, 'Renamed') });

			const n = new NotesSvelte();
			n.inputValue = 'Renamed';
			n.rightClickId = 7;
			await n.createCategory(true);

			expect(api.update).toHaveBeenCalledWith(
				expect.stringContaining('/notes/categories'),
				7,
				{ title: 'Renamed' }
			);
		});

		it('reloads the categories after creating one', async () => {
			api.create.mockResolvedValue({ data: category(3, 'Ideas') });
			api.list.mockResolvedValue({ data: [category(3, 'Ideas')] });

			const n = new NotesSvelte();
			n.inputValue = 'Ideas';
			await n.createCategory();

			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('/notes/categories'));
			expect(n.categories).toHaveLength(1);
		});

		it('collapses the parent category when it was not collapsed yet', async () => {
			api.create.mockResolvedValue({ data: category(4, 'Sub') });

			const n = new NotesSvelte();
			n.inputValue = 'Sub';
			n.createParent = 2;
			await n.createCategory();

			expect(n.isCategoryCollapsed(2)).toBe(true);
		});
	});
});
