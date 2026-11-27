import type {
	Link,
	CreateLinkRequest,
	UpdateLinkRequest,
	LinkCategory
} from '$lib/types/library_link';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';

export class LinkLibrary {
	config: LibraryConfig = {
		type: 'links',
		hasCovers: false,
		hasRatings: false,
		hasViewSwitcher: false,
		hasFilters: false,
		hasGenres: false,
		hasRecommender: false,
		hasWishlist: false,
		hasExternalLinks: false,
		hasReleases: false,
		hasShelf: false,
		entriesAreLinks: true,
		hasSmallForm: true
	};
	loaded = $state<boolean>(false);
	entries = $state<Link[]>([]);
	newestEntries = $state<Link[]>([]);
	filteredEntries = $state<Link[]>([]);
	categories = $state<LinkCategory[]>([]);
	categoriesCount = $state<{ id: number; count: number }[]>([]);
	activeFilter = $state<null | number | 'favorite'>(null);
	searchVisible = $state<boolean>(false);
	searchTerm = $state<string>('');
	searchActive = false;
	draggedEntry = $state<Link | null>(null);
	dragTarget = $state<number | null>(null);
	auth: Auth;
	view = 'list';
	createModalVisible = $state<boolean>(false);
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const [res, categoriesRes] = await Promise.all([
			this.apiService.list(apiRoutes.libraries.links.list),
			this.apiService.list(apiRoutes.libraries.links.listCategories)
		]);

		if (res) {
			this.entries = res.data as Link[];
			this.reapplyFilter();
			this.loaded = true;
		}
		if (categoriesRes) this.setCategories(categoriesRes.data as LinkCategory[]);
	}

	async loadNewest(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.links.newest);
		if (res) this.newestEntries = res.data as Link[];
	}

	async loadCategories(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.links.listCategories);
		if (res) this.setCategories(res.data as LinkCategory[]);
	}

	search(): void {
		this.searchActive = true;
		this.reapplyFilter();
	}

	getCategoryCount(categoryId?: number | null): number {
		if (categoryId === undefined) return this.entries.length;
		if (categoryId === null)
			return this.entries.filter((link) => link.category === null).length;

		return this.categoriesCount.find((category) => category.id === categoryId)?.count ?? 0;
	}

	getFavoriteCount(): number {
		return this.entries.filter((link) => link.is_favorite).length;
	}

	isCategoryChosen(): boolean {
		return typeof this.activeFilter === 'number';
	}

	getActiveCategoryId(): number | null {
		return typeof this.activeFilter === 'number' && this.activeFilter > 0
			? this.activeFilter
			: null;
	}

	openCreateModal(): void {
		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.createModalVisible = false;
	}

	filterByCategory(categoryId: number | null): void {
		this.activeFilter = categoryId;
		this.searchActive = false;
		this.reapplyFilter();
	}

	filterByFavorite(): void {
		this.activeFilter = 'favorite';
		this.searchActive = false;
		this.reapplyFilter();
	}

	async dragToCategory(): Promise<void> {
		if (this.draggedEntry === null) return;

		const request: UpdateLinkRequest = {
			category_id: this.dragTarget || null
		};
		const ok = await this.apiService.update(
			apiRoutes.libraries.links.update,
			this.draggedEntry.id,
			request
		);
		if (ok) await this.load();
	}

	async create(request: CreateLinkRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.links.create, request);
		if (res) await this.load();
		return res !== null;
	}

	async update(entry: Link, request: UpdateLinkRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.links.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return res;
	}

	async delete(entry: Link): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.links.delete, entry.id);
		if (res) await this.load();
		return res;
	}

	async createCategory(title: string, color?: string): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.links.createCategory, {
			title,
			color
		});
		if (res) await this.loadCategories();
		return res !== null;
	}

	async deleteCategory(category: LinkCategory): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.libraries.links.deleteCategory,
			category.id
		);
		if (res) {
			// The deleted category's links are now uncategorised. Leaving it as the
			// active filter would also send its id with the next new link.
			if (this.activeFilter === category.id) this.activeFilter = null;
			await this.load();
		}
		return res;
	}

	private setCategories(categories: LinkCategory[]): void {
		this.categories = categories;

		if (this.categoriesCount.length > 0) {
			this.categoriesCount = [];
		}

		for (const category of this.categories) {
			this.categoriesCount.push({
				id: category.id,
				count: this.entries.filter((link) => link.category?.id === category.id).length
			});
		}
	}

	private reapplyFilter(): void {
		this.filteredEntries = this.filterEntries();
	}

	private filterEntries(): Link[] {
		if (this.searchActive) return this.filterService.search(this.entries, this.searchTerm, ['title', 'url']);
		if (this.activeFilter === 'favorite') return this.entries.filter((link) => link.is_favorite);
		if (this.activeFilter === null) return this.entries;
		if (this.activeFilter === 0) return this.entries.filter((link) => link.category === null);
		return this.entries.filter((link) => link.category?.id === this.activeFilter);
	}
}

const LINK_LIBRARY_KEY = Symbol('SOLYTO_LINK_LIBRARY');

export function setLinkLibrary(): LinkLibrary {
	return setContext(LINK_LIBRARY_KEY, new LinkLibrary());
}

export function getLinkLibrary(): LinkLibrary {
	return getContext<LinkLibrary>(LINK_LIBRARY_KEY);
}
