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

// The Notes store reads getTranslation() / getUiNotifications() at field
// initialisation; storeMocks does not cover those modules, so stub them here.
const notifications = { error: vi.fn() };
const ts = {
	get: {
		notes: {
			create_error: 'Failed to create note.',
			create_folder_error: 'Failed to create folder.',
			journal_create_error: 'Failed to create the journal entry.'
		}
	}
};

vi.mock('$lib/state/Translation.svelte', () => ({
	getTranslation: () => ts
}));

vi.mock('$lib/state/UiNotifications.svelte', () => ({
	getUiNotifications: () => notifications
}));

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
		is_system: false,
		is_hidden: false,
		created_at: '',
		updated_at: '',
		children: [],
		...overrides
	};
}

interface Lists {
	notes?: Note[];
	hiddenNotes?: Note[];
	categories?: NoteCategory[];
	hiddenCategories?: NoteCategory[];
}

function mockLists(lists: Lists): void {
	const byUrl: [string, unknown[] | undefined][] = [
		['/notes/categories/hidden', lists.hiddenCategories],
		['/notes/categories', lists.categories],
		['/notes/hidden', lists.hiddenNotes],
		['/notes', lists.notes]
	];
	api.list.mockImplementation((url: string) => {
		const data = byUrl.find(([suffix]) => url.endsWith(suffix))?.[1];
		return Promise.resolve(data === undefined ? null : { data });
	});
}

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/notes';
	pageState.params = {};
	navigation.goto.mockReset();
	navigation.goto.mockResolvedValue(undefined);
	notifications.error.mockReset();
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

	describe('openCreateNoteModal', () => {
		it('sets the create parent and opens the note modal', async () => {
			const n = new NotesSvelte();
			await n.openCreateNoteModal(5);

			expect(n.createParent).toBe(5);
			expect(n.createType).toBe('note');
			expect(n.modalOpen).toBe(true);
		});

		it('clears a stale create parent when given null', async () => {
			const n = new NotesSvelte();
			n.createParent = 5;
			await n.openCreateNoteModal(null);

			expect(n.createParent).toBeNull();
			expect(n.createType).toBe('note');
			expect(n.modalOpen).toBe(true);
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
			mockLists({ notes: [note({ id: 'n9' })], hiddenNotes: [] });

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

		it('reports the failure and keeps the input and modal when creation fails', async () => {
			api.create.mockResolvedValue(null);

			const n = new NotesSvelte();
			n.inputValue = 'Doomed';
			n.modalOpen = true;
			await expect(n.create()).resolves.toBeNull();
			expect(n.inputValue).toBe('Doomed');
			expect(n.modalOpen).toBe(true);
			expect(notifications.error).toHaveBeenCalledWith('Failed to create note.');
			expect(navigation.goto).not.toHaveBeenCalled();
		});
	});

	describe('journal', () => {
		const journal = category(9, '.journal', { is_system: true, is_hidden: true });

		function withJournal(): NotesSvelte {
			const n = new NotesSvelte();
			n.journalCategory = journal;
			return n;
		}

		it('loadCategories resolves the journal folder and keeps it out of the tree', async () => {
			mockLists({
				categories: [category(1, 'Work'), category(2, 'Private')],
				hiddenCategories: [journal]
			});

			const n = new NotesSvelte();
			await n.loadCategories();

			expect(n.journalCategory?.id).toBe(9);
			expect(n.categories.map((c) => c.id)).toEqual([1, 2]);
		});

		it('loadCategories keeps a hidden user folder in the tree', async () => {
			const hiddenFolder = category(5, 'Secret', { parent_id: 1, is_hidden: true });
			mockLists({
				categories: [category(1, 'Work')],
				hiddenCategories: [journal, hiddenFolder]
			});

			const n = new NotesSvelte();
			await n.loadCategories();

			expect(n.journalCategory?.id).toBe(9);
			expect(n.categories.map((c) => c.id)).toEqual([1]);
			expect(n.categories[0].children.map((c) => c.id)).toEqual([5]);
		});

		it('loadCategories keeps the previous state when the hidden call fails', async () => {
			mockLists({ categories: [category(1, 'Work')] });

			const n = withJournal();
			n.categories = [category(2, 'Private')];
			await n.loadCategories();

			expect(n.journalCategory?.id).toBe(9);
			expect(n.categories.map((c) => c.id)).toEqual([2]);
		});

		it('load finds journal entries that only come from the hidden notes', async () => {
			const entry = note({ id: 'j1', title: '2026-08-04', category_id: 9 });
			const hiddenFolderNote = note({ id: 'h1', title: 'Secret', category_id: 5 });
			mockLists({ notes: [note({ id: 'o1' })], hiddenNotes: [entry, hiddenFolderNote] });

			const n = withJournal();
			await n.load();

			expect(n.getJournalEntry(new Date(2026, 7, 4))?.id).toBe('j1');
			expect(n.getVisibleNotes().map((x) => x.id)).toEqual(['o1', 'h1']);
		});

		it('load keeps the previous notes when the hidden call fails', async () => {
			mockLists({ notes: [note({ id: 'o1' })] });

			const n = new NotesSvelte();
			n.notes = [note({ id: 'old' })];
			await n.load();

			expect(n.loaded).toBe(false);
			expect(n.notes.map((x) => x.id)).toEqual(['old']);
		});

		it('getJournalEntry finds the day entry in the journal folder', () => {
			const n = withJournal();
			n.notes = [
				note({ id: 'j1', title: '2026-08-04', category_id: 9 }),
				note({ id: 'j2', title: '2026-08-04', category_id: 1 })
			];
			expect(n.getJournalEntry(new Date(2026, 7, 4))?.id).toBe('j1');
		});

		it('getJournalEntryDates lists the dates with entries', () => {
			const n = withJournal();
			n.notes = [
				note({ id: 'j1', title: '2026-08-04', category_id: 9 }),
				note({ id: 'x', title: 'Scribble', category_id: 9 }),
				note({ id: 'o', title: '2026-08-01', category_id: 1 })
			];
			expect(n.getJournalEntryDates()).toEqual(['2026-08-04']);
		});

		it('openJournalEntry reuses an existing entry without creating', async () => {
			const n = withJournal();
			n.notes = [note({ id: 'j1', title: '2026-08-04', category_id: 9 })];

			const result = await n.openJournalEntry(new Date(2026, 7, 4));

			expect(result?.id).toBe('j1');
			expect(n.activeNote?.id).toBe('j1');
			expect(api.create).not.toHaveBeenCalled();
		});

		it('openJournalEntry opens an in-memory draft without creating', async () => {
			const n = withJournal();
			const result = await n.openJournalEntry(new Date(2026, 7, 4));

			expect(api.create).not.toHaveBeenCalled();
			expect(result?.id).toBe('');
			expect(result?.title).toBe('2026-08-04');
			expect(result?.category_id).toBe(9);
			expect(n.activeNote).toBe(result);
			expect(n.isJournalDraft(n.activeNote)).toBe(true);
		});

		it('saveContent does not create an entry for an untouched draft', async () => {
			const n = withJournal();
			await n.openJournalEntry(new Date(2026, 7, 4));

			await expect(n.saveContent()).resolves.toBe(true);

			expect(api.create).not.toHaveBeenCalled();
			expect(api.update).not.toHaveBeenCalled();
		});

		it('saveContent creates the draft once it has content, then stores the content', async () => {
			api.create.mockResolvedValue({
				data: note({ id: 'j5', title: '2026-08-04', category_id: 9 })
			});
			api.update.mockResolvedValue({
				data: note({ id: 'j5', title: '2026-08-04', category_id: 9 })
			});
			mockLists({
				notes: [],
				hiddenNotes: [note({ id: 'j5', title: '2026-08-04', category_id: 9 })]
			});

			const n = withJournal();
			const draft = await n.openJournalEntry(new Date(2026, 7, 4));
			draft!.content = '<p>Hello</p>';

			await expect(n.saveContent()).resolves.toBe(true);

			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/notes'), {
				title: '2026-08-04',
				category_id: 9
			});
			expect(api.update).toHaveBeenCalledWith(expect.stringContaining('/notes'), 'j5', {
				content: '<p>Hello</p>'
			});
			expect(n.activeNote?.id).toBe('j5');
		});

		it('saveContent reports an error when draft creation fails', async () => {
			api.create.mockResolvedValue(null);

			const n = withJournal();
			const draft = await n.openJournalEntry(new Date(2026, 7, 4));
			draft!.content = '<p>Hello</p>';

			await expect(n.saveContent()).resolves.toBe(false);
			expect(api.update).not.toHaveBeenCalled();
			expect(notifications.error).toHaveBeenCalledWith('Failed to create the journal entry.');
		});

		it('openJournalEntry does nothing when no journal folder is known', async () => {
			const n = new NotesSvelte();
			await expect(n.openJournalEntry(new Date(2026, 7, 4))).resolves.toBeNull();
			expect(api.create).not.toHaveBeenCalled();
		});

		it('excludes journal entries from the ordinary note surfaces', () => {
			const n = withJournal();
			n.notes = [
				note({
					id: 'j1',
					title: '2026-08-04',
					category_id: 9,
					is_favorite: true,
					created_at: '2026-09-01T00:00:00',
					updated_at: '2026-09-01T00:00:00'
				}),
				note({
					id: 'o1',
					title: 'Ordinary',
					category_id: null,
					created_at: '2026-01-01T00:00:00',
					updated_at: '2026-01-01T00:00:00'
				})
			];

			expect(n.getVisibleNotes().map((x) => x.id)).toEqual(['o1']);
			expect(n.getNewestNotes().map((x) => x.id)).toEqual(['o1']);
			expect(n.getLastUpdatedNotes().map((x) => x.id)).toEqual(['o1']);
			expect(n.getFavorites()).toEqual([]);
			expect(n.getNotesForCategory(null).map((x) => x.id)).toEqual(['o1']);
			expect(n.getNotesForCategory(9)).toEqual([]);
		});

		it('re-snapshots the overview lists once the journal folder is resolved', async () => {
			const entry = note({
				id: 'j1',
				title: '2026-08-04',
				category_id: 9,
				is_favorite: true,
				created_at: '2026-09-01T00:00:00',
				updated_at: '2026-09-01T00:00:00'
			});
			const ordinary = note({
				id: 'o1',
				title: 'Ordinary',
				category_id: null,
				created_at: '2026-01-01T00:00:00',
				updated_at: '2026-01-01T00:00:00'
			});

			mockLists({
				notes: [ordinary],
				hiddenNotes: [entry],
				categories: [],
				hiddenCategories: [journal]
			});

			const n = new NotesSvelte();
			// Worst case: the notes resolve before the categories, so the journal
			// flag is still unknown when `load()` snapshots the overview.
			await n.load();
			expect(n.newestNotes.map((x) => x.id)).toContain('j1');

			await n.loadCategories();

			expect(n.newestNotes.map((x) => x.id)).toEqual(['o1']);
			expect(n.lastUpdatedNotes.map((x) => x.id)).toEqual(['o1']);
			expect(n.favoriteNotes).toEqual([]);
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
			mockLists({ categories: [category(3, 'Ideas')], hiddenCategories: [] });

			const n = new NotesSvelte();
			n.inputValue = 'Ideas';
			await n.createCategory();

			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/notes\/categories$/));
			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/notes\/categories\/hidden$/));
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

		it('reports the failure and keeps the input and modal when creation fails', async () => {
			api.create.mockResolvedValue(null);

			const n = new NotesSvelte();
			n.inputValue = 'Doomed';
			n.modalOpen = true;
			await expect(n.createCategory()).resolves.toBeNull();
			expect(n.inputValue).toBe('Doomed');
			expect(n.modalOpen).toBe(true);
			expect(notifications.error).toHaveBeenCalledWith('Failed to create folder.');
			expect(api.list).not.toHaveBeenCalled();
		});
	});
});
