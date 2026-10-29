import type {
	CreateNoteCategoryRequest,
	CreateNoteRequest,
	Note,
	NoteCategory,
	UpdateNoteCategoryRequest,
	UpdateNoteRequest
} from '$lib/types/note';
import { setContext, getContext, tick } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { urls } from '$lib/config/urls';
import { resolve } from '$app/paths';
import ApiService from '$lib/services/ApiService';
import JournalService from '$lib/services/JournalService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class NotesSvelte {
	static readonly LS_COLLAPSED_CATEGORIES_KEY: string = 'notes.collapsedCategories';

	loaded = $state<boolean>(false);
	notes = $state<Note[]>([]);
	newestNotes = $state<Note[]>([]);
	lastUpdatedNotes = $state<Note[]>([]);
	favoriteNotes = $state<Note[]>([]);
	categories = $state<NoteCategory[]>([]);
	journalCategory = $state<NoteCategory | null>(null);
	collapsedCategories = $state<number[]>([]);
	activeNote = $state<Note | null>(null);
	modalOpen = $state<boolean>(false);
	createType = $state<'note' | 'category'>('note');
	createParent = $state<number | null>(null);
	rightClickMenuOpen = $state<boolean>(false);
	rightClickMenuX = $state<number>(0);
	rightClickMenuY = $state<number>(0);
	rightClickType = $state<'note' | 'category'>('note');
	rightClickId = $state<number | string | null>(null);
	draggedNote = $state<Note | null>(null);
	dragTarget = $state<NoteCategory | null>(null);
	input = $state<HTMLInputElement | null>(null);
	inputValue = $state<string>('');
	auth: Auth;
	ts: Translation;
	notifications: UiNotifications;
	apiService: ApiService;
	localStorage: LocalStorageService;
	journalService = new JournalService();

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

	async load(): Promise<void> {
		const [res, hiddenRes] = await Promise.all([
			this.apiService.list(apiRoutes.notes.list),
			this.apiService.list(apiRoutes.notes.listHidden)
		]);
		if (res && hiddenRes) {
			this.loaded = true;
			this.notes = [...(res.data as Note[]), ...(hiddenRes.data as Note[])];
			this.newestNotes = this.getNewestNotes();
			this.lastUpdatedNotes = this.getLastUpdatedNotes();
			this.favoriteNotes = this.getFavorites();
			this.checkUrlForActiveNote();
		}
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

	checkUrlForActiveNote(): void {
		if (page.params.id) {
			this.selectNote(page.params.id);
		}
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
			this.newestNotes = this.getNewestNotes();
			this.lastUpdatedNotes = this.getLastUpdatedNotes();
			this.favoriteNotes = this.getFavorites();
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

	getCategoryTitle(categoryId: number): string {
		for (const cat of this.categories) {
			if (cat.id === categoryId) return cat.title;
			if (cat.children) {
				for (const child of cat.children) {
					if (child.id === categoryId) return child.title;
				}
			}
		}

		return '-';
	}

	getLastUpdatedNotes(): Note[] {
		return this.getVisibleNotes()
			.sort(
				(a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
			)
			.slice(0, 5);
	}

	getNewestNotes(): Note[] {
		return this.getVisibleNotes()
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			)
			.slice(0, 5);
	}

	getFavorites(): Note[] {
		return this.getVisibleNotes().filter((n) => n.is_favorite);
	}

	selectNote(noteId: string): void {
		this.activeNote = this.notes.find((n) => n.id === noteId) ?? null;
	}

	async openModal(type: 'note' | 'category', edit: boolean = false): Promise<void> {
		if (type === 'category' && edit && this.rightClickId) {
			this.inputValue =
				this.categories.filter((c) => c.id === this.rightClickId)[0]?.title ?? '';
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

	openRightClickMenu(event: MouseEvent, type: 'note' | 'category', id: number | string): void {
		event.preventDefault();

		this.rightClickType = type;
		this.rightClickMenuX = event.clientX;
		this.rightClickMenuY = event.clientY;
		this.rightClickId = id;
		this.createParent = type === 'category' ? id as number : null;
		this.rightClickMenuOpen = true;
	}

	closeRightClickMenu(): void {
		this.rightClickMenuOpen = false;
	}

	async dragToCategory(): Promise<void> {
		if (this.draggedNote === null) return;

		const request: UpdateNoteRequest = {
			category_id: this.dragTarget ? this.dragTarget.id : null
		};
		const ok = await this.apiService.update(
			apiRoutes.notes.update,
			this.draggedNote.id,
			request
		);
		if (ok) await this.load();
		return Promise.resolve();
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
		this.activeNote = this.notes.find((n) => n.id === note.id) ?? note;
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

		// A journal draft is persisted only once it has content. Creating takes
		// two calls because the create contract does not accept content.
		if (this.isJournalDraft(this.activeNote)) {
			if (!this.journalService.hasContent(this.activeNote.content)) return true;

			const createRes = await this.apiService.create(apiRoutes.notes.create, {
				title: this.activeNote.title,
				category_id: this.activeNote.category_id
			});
			if (!createRes) {
				this.notifications.error(this.ts.get.notes.journal_create_error);
				return false;
			}

			const created = createRes.data as Note;
			const updateRes = await this.apiService.update(apiRoutes.notes.update, created.id, {
				content: this.activeNote.content
			});
			if (!updateRes) {
				this.notifications.error(this.ts.get.notes.save_error);
				return false;
			}

			await this.load();
			this.activeNote = this.notes.find((n) => n.id === created.id) ?? created;
			return true;
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

	async deleteCategory(): Promise<boolean> {
		if (this.rightClickType === 'note' || typeof this.rightClickId !== 'number') {
			return false;
		}

		const ok = await this.apiService.delete(apiRoutes.notes.deleteCategory, this.rightClickId);
		if (ok) await this.loadCategories();
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
}

const NOTES_KEY = Symbol('SOLYTO_NOTES');

export function setNotes(): NotesSvelte {
	return setContext(NOTES_KEY, new NotesSvelte());
}

export function getNotes(): NotesSvelte {
	return getContext<NotesSvelte>(NOTES_KEY);
}
