import type {
	Link,
	CreateLinkRequest,
	UpdateLinkRequest,
	LinkCategory,
	CreateLinkCategoryRequest
} from '$lib/types/library_link';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
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
		entriesAreLinks: true
	};
	loaded = $state<boolean>(false);
	entries = $state<Link[]>([]);
	filteredEntries = $state<Link[]>([]);
	categories = $state<LinkCategory[]>([]);
	categoriesCount = $state<{ id: number; count: number }[]>([]);
	activeFilter = $state<null | number | 'favorite'>(null);
	searchVisible = $state<boolean>(false);
	searchTerm = $state<string>('');
	draggedEntry = $state<Link | null>(null);
	dragTarget = $state<number | null>(null);
	auth = getAuth();
	view = 'list';
	createModalVisible = $state<boolean>(false);
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.links.list);

		if (res) {
			this.entries = res.data as Link[];
			await this.loadCategories();
			this.reapplyFilter();
			this.loaded = true;
		}
	}

	async loadCategories(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.links.listCategories);

		if (res) {
			this.categories = res.data as LinkCategory[];

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
	}

	search(): void {
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'title',
			'url'
		]);
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

	openCreateModal(): void {
		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.createModalVisible = false;
	}

	filterByCategory(categoryId: number | null): void {
		this.activeFilter = categoryId;

		if (categoryId === null) {
			this.filteredEntries = this.entries;
		} else if (categoryId === 0) {
			this.filteredEntries = this.entries.filter((link) => link.category === null);
		} else {
			this.filteredEntries = this.entries.filter((link) => link.category?.id === categoryId);
		}
	}

	filterByFavorite(): void {
		this.activeFilter = 'favorite';
		this.filteredEntries = this.entries.filter((link) => link.is_favorite);
	}

	reapplyFilter(): void {
		if (this.activeFilter === 'favorite') {
			this.filterByFavorite();
		} else {
			this.filterByCategory(this.activeFilter);
		}
	}

	async dragToCategory(): Promise<void> {
		if (this.draggedEntry === null) return;

		const request: UpdateLinkRequest = {
			category_id: this.dragTarget ? this.dragTarget : null
		};
		const ok = await this.apiService.update(
			apiRoutes.libraries.links.update,
			this.draggedEntry.id,
			request
		);
		if (ok) await this.load();
		return Promise.resolve();
	}

	async create(request: CreateLinkRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.links.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async update(entry: Link, request: UpdateLinkRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.links.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(entry: Link): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.links.delete, entry.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async deleteByLink(link: string): Promise<boolean> {
		const entry = this.entries.find((entry) => entry.url === link);
		if (entry) return await this.delete(entry);
		return Promise.resolve(false);
	}

	async createCategory(title: string, color?: string): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.links.createCategory, {
			title,
			color
		});
		if (res) await this.loadCategories();
		return Promise.resolve(res !== null);
	}

	async deleteCategory(category: LinkCategory): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.libraries.links.deleteCategory,
			category.id
		);
		if (res) await this.loadCategories();
		return Promise.resolve(res !== null);
	}
}

const LINK_LIBRARY_KEY = Symbol('SOLYTO_LINK_LIBRARY');

export function setLinkLibrary(): LinkLibrary {
	return setContext(LINK_LIBRARY_KEY, new LinkLibrary());
}

export function getLinkLibrary(): LinkLibrary {
	return getContext<LinkLibrary>(LINK_LIBRARY_KEY);
}
