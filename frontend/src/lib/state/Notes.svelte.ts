import type {
	CreateNoteCategoryRequest,
	CreateNoteRequest,
	Note,
	NoteBacklink,
	NoteCategory,
	UpdateNoteCategoryRequest,
	UpdateNoteRequest
} from '$lib/types/note';
import { setContext, getContext, tick, flushSync } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { urls } from '$lib/config/urls';
import { resolve } from '$app/paths';
import ApiService from '$lib/services/ApiService';
import JournalService from '$lib/services/JournalService';
import NoteSearchService from '$lib/services/NoteSearchService';
import NoteLinkService from '$lib/services/NoteLinkService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class NotesSvelte {
	static readonly LS_COLLAPSED_CATEGORIES_KEY: string = 'notes.collapsedCategories';
	static readonly SEARCH_RESULT_LIMIT: number = 10;
	static readonly LAST_UPDATED_LIMIT: number = 10;
	static readonly LINK_PICKER_LIMIT: number = 10;
	static readonly LINK_SUGGESTION_LIMIT: number = 8;

	loaded = $state<boolean>(false);
	notes = $state<Note[]>([]);
	hiddenNoteIds = $state<string[]>([]);
	backlinks = $state<NoteBacklink[]>([]);
	lastUpdatedNotes = $state<Note[]>([]);
	recentNotes = $state<Note[]>([]);
	recentNotesLoaded = $state<boolean>(false);
	favoriteNotes = $state<Note[]>([]);
	categories = $state<NoteCategory[]>([]);
	journalCategory = $state<NoteCategory | null>(null);
	collapsedCategories = $state<number[]>([]);
	activeNote = $state<Note | null>(null);
	modalOpen = $state<boolean>(false);
	deleteNoteModalOpen = $state<boolean>(false);
	createType = $state<'note' | 'category'>('note');
	createParent = $state<number | null>(null);
	rightClickMenuOpen = $state<boolean>(false);
	rightClickMenuX = $state<number>(0);
	rightClickMenuY = $state<number>(0);
	rightClickType = $state<'note' | 'category'>('note');
	rightClickId = $state<number | string | null>(null);
	draggedNote = $state<Note | null>(null);
	dragTarget = $state<NoteCategory | null>(null);
	noteToMove = $state<Note | null>(null);
	input = $state<HTMLInputElement | null>(null);
	inputValue = $state<string>('');
	searchVisible = $state<boolean>(false);
	searchTerm = $state<string>('');
	searchResults = $state<Note[]>([]);
	searchIndex = $state<number>(0);
	auth: Auth;
	ts: Translation;
	notifications: UiNotifications;
	apiService: ApiService;
	localStorage: LocalStorageService;
	journalService = new JournalService();
	searchService = new NoteSearchService();
	linkService = new NoteLinkService();
	private backlinksNoteId: string | null = null;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService(),
		ts: Translation = getTranslation(),
		notifications: UiNotifications = getUiNotifications()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;
		this.ts = ts;
		this.notifications = notifications;
		this.loadCollapsedCategories();
	}

	get journalEnabled(): boolean {
		return this.auth.user?.settings?.journal_enabled ?? false;
	}

	async load(): Promise<void> {
		const [res, hiddenRes] = await Promise.all([
			this.apiService.list(apiRoutes.notes.list),
			this.apiService.list(apiRoutes.notes.listHidden)
		]);
		if (res && hiddenRes) {
			this.loaded = true;
			this.notes = [...(res.data as Note[]), ...(hiddenRes.data as Note[])];
			this.hiddenNoteIds = (hiddenRes.data as Note[]).map((n) => n.id);
			this.lastUpdatedNotes = this.getLastUpdatedNotes();
			this.favoriteNotes = this.getFavorites();
			this.syncActiveNoteWithUrl();
			await this.reloadShownBacklinks();
		}
	}

	async loadRecent(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.notes.recent);
		if (res) this.recentNotes = res.data as Note[];
		this.recentNotesLoaded = true;
	}

	loadCollapsedCategories(): void {
		const stored = this.localStorage.getJson(NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY);
		this.collapsedCategories = (stored as number[] | null) ?? [];
	}

	saveCollapsedCategories(): void {
		this.localStorage.setJson(
			NotesSvelte.LS_COLLAPSED_CATEGORIES_KEY,
			this.collapsedCategories
		);
	}

	syncActiveNoteWithUrl(): void {
		if (page.route.id === urls.journalDate) {
			this.openJournalEntryFromUrl();
			return;
		}

		if (page.params.id) {
			this.selectNote(page.params.id);
		} else {
			this.activeNote = null;
		}
	}

	private openJournalEntryFromUrl(): void {
		const key = page.params.date ?? '';
		const day = this.journalService.parseEntryTitle(key);
		if (!this.loaded || day === null || !this.journalService.isReachable(day)) return;
		if (this.activeNote !== null && this.isJournalNote(this.activeNote) && this.activeNote.title === key) return;

		void this.openJournalEntry(day);
	}

	async loadBacklinks(noteId: string): Promise<void> {
		this.backlinks = [];
		this.backlinksNoteId = noteId;
		await this.fetchBacklinks(noteId);
	}

	async loadCategories(): Promise<void> {
		const [res, hiddenRes] = await Promise.all([
			this.apiService.list(apiRoutes.notes.listCategories),
			this.apiService.list(apiRoutes.notes.listHiddenCategories)
		]);
		if (res && hiddenRes) {
			const all = this.journalService.mergeCategories(
				res.data as NoteCategory[],
				hiddenRes.data as NoteCategory[]
			);
			this.journalCategory = this.journalService.findJournalCategory(all);
			this.categories = all.filter((c) => !c.is_system);
			this.lastUpdatedNotes = this.getLastUpdatedNotes();
			this.favoriteNotes = this.getFavorites();
			if (page.route.id === urls.journalDate) this.openJournalEntryFromUrl();
		}
	}

	isJournalNote(note: Note): boolean {
		return this.journalCategory !== null && note.category_id === this.journalCategory.id;
	}

	isJournalDraft(note: Note | null): boolean {
		return note !== null && note.id === '' && this.isJournalNote(note);
	}

	getJournalEntry(date: Date): Note | null {
		if (this.journalCategory === null) return null;
		return this.journalService.findEntry(this.notes, this.journalCategory.id, date);
	}

	getJournalEntryDates(): string[] {
		if (this.journalCategory === null) return [];
		return this.journalService.getEntryDates(this.notes, this.journalCategory.id);
	}

	async openJournalEntry(date: Date): Promise<Note | null> {
		if (this.journalCategory === null) return null;

		const existing = this.getJournalEntry(date);
		if (existing) {
			this.activeNote = existing;
			return existing;
		}

		const draft: Note = {
			id: '',
			title: this.journalService.getEntryTitle(date),
			content: '',
			category_id: this.journalCategory.id,
			tags: [],
			is_favorite: false,
			created_at: '',
			updated_at: ''
		};
		this.activeNote = draft;

		return draft;
	}

	toggleCollapseCategory(categoryId: number): void {
		if (this.collapsedCategories.includes(categoryId)) {
			this.collapsedCategories = this.collapsedCategories.filter((c) => c !== categoryId);
		} else {
			this.collapsedCategories.push(categoryId);
		}

		this.saveCollapsedCategories();
	}

	isCategoryCollapsed(categoryId: number): boolean {
		return this.collapsedCategories.includes(categoryId);
	}

	getNotesForCategory(categoryId: number | null): Note[] {
		return this.notes.filter((n) => n.category_id === categoryId && !this.isJournalNote(n));
	}

	getVisibleNotes(): Note[] {
		return this.notes.filter((n) => !this.isJournalNote(n));
	}

	searchLinkableNotes(term: string, limit: number): Note[] {
		const linkable = this.getVisibleNotes().filter((n) => {
			return n.id !== this.activeNote?.id && !this.hiddenNoteIds.includes(n.id);
		});

		return this.linkService.searchByTitle(linkable, term, limit);
	}

	findNote(noteId: string): Note | null {
		return this.notes.find((n) => n.id === noteId) ?? null;
	}

	getCategoryTitle(categoryId: number): string {
		return this.findCategory(this.categories, categoryId)?.title ?? '-';
	}

	private findCategory(categories: NoteCategory[], categoryId: number): NoteCategory | null {
		for (const cat of categories) {
			if (cat.id === categoryId) return cat;

			const child = this.findCategory(cat.children, categoryId);
			if (child !== null) return child;
		}

		return null;
	}

	getLastUpdatedNotes(): Note[] {
		return this.getVisibleNotes()
			.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
			.slice(0, NotesSvelte.LAST_UPDATED_LIMIT);
	}

	getFavorites(): Note[] {
		return this.getVisibleNotes().filter((n) => n.is_favorite);
	}

	selectNote(noteId: string): void {
		// The editor is not remounted for the same id, so it still shows (and saves) its own content.
		const localContent = this.activeNote?.id === noteId ? this.activeNote.content : null;
		this.activeNote = this.notes.find((n) => n.id === noteId) ?? null;
		if (this.activeNote !== null && localContent !== null) this.activeNote.content = localContent;
	}

	// Mounts NoteSearch synchronously so it focuses inside the tap; iOS only opens the keyboard then.
	openSearch(): void {
		this.searchVisible = true;
		flushSync();
	}

	closeSearch(): void {
		this.searchVisible = false;
		this.searchTerm = '';
		this.searchResults = [];
		this.searchIndex = 0;
	}

	search(): void {
		this.searchResults = this.searchService.search(
			this.getVisibleNotes(),
			this.searchTerm,
			NotesSvelte.SEARCH_RESULT_LIMIT
		);
		this.searchIndex = 0;
	}

	moveSearchSelection(delta: number): void {
		const last = Math.max(this.searchResults.length - 1, 0);
		this.searchIndex = Math.min(Math.max(this.searchIndex + delta, 0), last);
	}

	async openNote(noteId: string): Promise<void> {
		await goto(resolve(urls.note, { id: noteId }));
	}

	async openSearchResult(note: Note | undefined = this.searchResults[this.searchIndex]): Promise<void> {
		if (note === undefined) return;

		this.closeSearch();
		await goto(resolve(urls.note, { id: note.id }));
	}

	async openModal(type: 'note' | 'category', edit: boolean = false): Promise<void> {
		if (type === 'category' && edit && this.rightClickId) {
			this.inputValue = this.categories.find((c) => c.id === this.rightClickId)?.title ?? '';
		} else {
			this.inputValue = '';
		}

		this.createType = type;
		this.modalOpen = true;

		await tick();

		setTimeout(() => this.input?.focus(), 100);
	}

	closeModal(): void {
		this.modalOpen = false;
	}

	async openCreateNoteModal(parent: number | null): Promise<void> {
		this.createParent = parent;
		await this.openModal('note');
	}

	openRightClickMenu(x: number, y: number, type: 'note' | 'category', id: number | string): void {
		this.rightClickType = type;
		this.rightClickMenuX = x;
		this.rightClickMenuY = y;
		this.rightClickId = id;
		this.createParent = type === 'category' ? id as number : null;
		this.rightClickMenuOpen = true;
	}

	closeRightClickMenu(): void {
		this.rightClickMenuOpen = false;
	}

	openMoveNoteModal(noteId: string): void {
		this.noteToMove = this.notes.find((n) => n.id === noteId) ?? null;
		this.closeRightClickMenu();
	}

	closeMoveNoteModal(): void {
		this.noteToMove = null;
	}

	async moveToCategory(noteId: string, categoryId: number | null): Promise<boolean> {
		const request: UpdateNoteRequest = { category_id: categoryId };
		const ok = await this.apiService.update(apiRoutes.notes.update, noteId, request);
		if (ok) await this.load();
		return ok;
	}

	async create(): Promise<Note | null> {
		if (this.inputValue === '') {
			return null;
		}

		const request: CreateNoteRequest =
			this.createParent !== null
				? { title: this.inputValue, category_id: this.createParent }
				: { title: this.inputValue };
		const res = await this.apiService.create(apiRoutes.notes.create, request);

		if (!res) {
			// Keep the modal and the user's input intact so the note (and the
			// failure) is not silently swallowed; a 401 is recovered upstream.
			this.notifications.error(this.ts.get.notes.create_error);
			this.rightClickMenuOpen = false;
			return null;
		}

		const note = res.data as Note;

		if (this.createParent && !this.collapsedCategories.includes(this.createParent)) {
			this.toggleCollapseCategory(this.createParent);
		}

		this.inputValue = '';
		this.createParent = null;
		this.rightClickMenuOpen = false;
		this.modalOpen = false;

		await this.load();
		await goto(resolve(urls.note, { id: note.id }));

		return note;
	}

	async createCategory(edit: boolean = false): Promise<NoteCategory | null> {
		if (this.inputValue === '') {
			return null;
		}

		let res;

		if (edit && this.rightClickId) {
			const request: UpdateNoteCategoryRequest = { title: this.inputValue };
			res = await this.apiService.update(
				apiRoutes.notes.updateCategory,
				this.rightClickId,
				request
			);
		} else {
			const request: CreateNoteCategoryRequest =
				this.createParent !== null
					? { title: this.inputValue, parent_id: this.createParent }
					: { title: this.inputValue };
			res = await this.apiService.create(apiRoutes.notes.createCategory, request);
		}

		if (!res) {
			this.notifications.error(this.ts.get.notes.create_folder_error);
			this.rightClickMenuOpen = false;
			return null;
		}

		await this.loadCategories();

		if (this.createParent && !this.collapsedCategories.includes(this.createParent)) {
			this.toggleCollapseCategory(this.createParent);
		}

		this.inputValue = '';
		this.createParent = null;
		this.rightClickMenuOpen = false;
		this.modalOpen = false;

		return typeof res === 'object' ? (res.data as NoteCategory) : null;
	}

	async saveContent(): Promise<boolean> {
		if (this.activeNote === null) return false;

		if (this.isJournalDraft(this.activeNote)) {
			if (!this.journalService.hasContent(this.activeNote.content)) return true;
			return this.createJournalEntry(this.activeNote);
		}

		const request: UpdateNoteRequest = { content: this.activeNote.content };
		const ok = await this.apiService.update(
			apiRoutes.notes.update,
			this.activeNote.id,
			request
		);
		if (ok) await this.load();
		return ok;
	}

	async changeTitle(title: string): Promise<boolean> {
		const request: UpdateNoteRequest = { title: title };
		const ok = await this.apiService.update(
			apiRoutes.notes.update,
			this.activeNote!.id,
			request
		);
		if (ok) await this.load();
		return ok;
	}

	async updateFavoriteStatus(note: Note, isFavorite: boolean): Promise<boolean> {
		const request: UpdateNoteRequest = { is_favorite: isFavorite };
		const ok = await this.apiService.update(apiRoutes.notes.update, note.id, request);
		if (ok) await this.load();
		return ok;
	}

	async addTag(tagId: number): Promise<boolean> {
		const tagIds = this.activeNote!.tags.map((t) => t.id);
		const request: UpdateNoteRequest = { tags: tagIds.concat([tagId]) };
		const ok = await this.apiService.update(
			apiRoutes.notes.update,
			this.activeNote!.id,
			request
		);

		if (ok) await this.load();
		return ok;
	}

	async removeTag(tagId: number): Promise<boolean> {
		const tagIds = this.activeNote!.tags.map((t) => t.id);
		const request: UpdateNoteRequest = { tags: tagIds.filter((id) => id != tagId) };
		const ok = await this.apiService.update(
			apiRoutes.notes.update,
			this.activeNote!.id,
			request
		);

		if (ok) await this.load();
		return ok;
	}

	async delete(): Promise<boolean> {
		if (this.rightClickType === 'category' || typeof this.rightClickId !== 'string') {
			return false;
		}

		const ok = await this.apiService.delete(apiRoutes.notes.delete, this.rightClickId);
		if (ok) {
			if (this.activeNote?.id === this.rightClickId) {
				await goto(resolve(urls.notes));
			}

			await this.load();
			this.closeRightClickMenu();
		}
		return ok;
	}

	async deleteActiveNote(): Promise<boolean> {
		if (!this.activeNote) return false;

		const ok = await this.apiService.delete(apiRoutes.notes.delete, this.activeNote.id);
		if (ok) {
			await goto(resolve(urls.notes));
			await this.load();
		}
		return ok;
	}

	async deleteCategory(categoryId: number): Promise<boolean> {
		const activeId = this.activeNote?.id;
		const activeWasSaved = this.notes.some((n) => n.id === activeId);

		const ok = await this.apiService.delete(apiRoutes.notes.deleteCategory, categoryId);
		if (ok) {
			// The API also deletes every note in the folder and its subfolders.
			await Promise.all([this.loadCategories(), this.load()]);
			if (activeWasSaved && !this.notes.some((n) => n.id === activeId)) {
				await goto(resolve(urls.notes));
			}
		}
		this.closeRightClickMenu();
		return ok;
	}

	async importFile(file: File): Promise<boolean> {
		const formData = new FormData();
		formData.append('file', file);
		const ok = await this.apiService.post(apiRoutes.notes.import, formData);

		if (ok) {
			await this.load();
			return true;
		}

		return false;
	}

	// Deleting, hiding or renaming a linking note elsewhere changes the list shown below the active note.
	private async reloadShownBacklinks(): Promise<void> {
		const noteId = this.backlinksNoteId;
		if (noteId === null || this.backlinks.length === 0 || this.activeNote?.id !== noteId) return;

		await this.fetchBacklinks(noteId);
	}

	private async fetchBacklinks(noteId: string): Promise<void> {
		const res = await this.apiService.list(apiRoutes.notes.backlinks.replace('%s', noteId));
		// A slower response for a note the user already left must not overwrite the current list.
		if (!res || this.backlinksNoteId !== noteId) return;

		this.backlinks = res.data as NoteBacklink[];
	}

	// The create contract does not accept content, so the entry is created first and then filled.
	private async createJournalEntry(draft: Note): Promise<boolean> {
		const createRes = await this.apiService.create(apiRoutes.notes.create, {
			title: draft.title,
			category_id: draft.category_id
		});
		if (!createRes) {
			this.notifications.error(this.ts.get.notes.journal_create_error);
			return false;
		}

		const created = createRes.data as Note;
		const updateRes = await this.apiService.update(apiRoutes.notes.update, created.id, {
			content: draft.content
		});
		if (!updateRes) {
			this.notifications.error(this.ts.get.notes.save_error);
			return false;
		}

		await this.load();
		this.activeNote = this.notes.find((n) => n.id === created.id) ?? created;
		return true;
	}
}

const NOTES_KEY = Symbol('SOLYTO_NOTES');

export function setNotes(): NotesSvelte {
	return setContext(NOTES_KEY, new NotesSvelte());
}

export function getNotes(): NotesSvelte {
	return getContext<NotesSvelte>(NOTES_KEY);
}
