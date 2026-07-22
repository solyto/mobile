import type {
	Recipe,
	RecipeType,
	CreateRecipeRequest,
	UpdateRecipeRequest,
	RecipeRelease
} from '$lib/types/library_recipe';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';
import type { Book } from '$lib/types/library_book';

export class RecipeLibrary {
	config: LibraryConfig = {
		type: 'recipes',
		hasCovers: true,
		hasRatings: true,
		hasViewSwitcher: true,
		hasFilters: true,
		hasGenres: false,
		hasRecommender: false,
		hasWishlist: false,
		hasExternalLinks: true,
		hasReleases: false,
		hasShelf: false,
		entriesAreLinks: false
	};
	loaded = $state<boolean>(false);
	entries = $state<Recipe[]>([]);
	filteredEntries = $state<Recipe[]>([]);
	createModalVisible = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	activeEntry = $state<Recipe | null>(null);
	ratingFilter = $state<number | null>(null);
	typeFilter = $state<RecipeType | null>(null);
	searchTerm = $state<string>('');
	view = $state<'list' | 'cards'>('cards');
	auth = getAuth();
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.recipes.list);
		if (res) {
			this.entries = res.data as Recipe[];
			this.filteredEntries = this.entries;
			this.loaded = true;
		}
	}

	search(): void {
		this.ratingFilter = null;
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'title',
			'ingredients'
		]);
	}

	filter(): void {
		let entries = this.entries;

		if (this.ratingFilter !== null) {
			entries = this.filterService.byRating(entries, this.ratingFilter);
		}

		if (this.typeFilter !== null) {
			entries = this.filterService.byType(entries, this.typeFilter);
		}

		this.filteredEntries = entries;
	}

	addRatingFilter(rating: number | null): void {
		this.ratingFilter = rating;
		this.filter();
	}

	addTypeFilter(type: RecipeType | null): void {
		this.typeFilter = type;
		this.filter();
	}

	openCreateModal(entry?: Recipe): void {
		if (entry) this.activeEntry = entry;

		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeEntry = null;
		this.createModalVisible = false;
	}

	openDetailModal(entry: Recipe) {
		this.activeEntry = entry;
		this.detailModalVisible = true;
		this.searchVisible = false;
	}

	closeDetailModal(): void {
		this.detailModalVisible = false;
		this.activeEntry = null;
	}

	switchView(): void {
		this.view = this.view === 'list' ? 'cards' : 'list';
	}

	async create(request: CreateRecipeRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.recipes.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async update(entry: Recipe, request: UpdateRecipeRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.recipes.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(entry: Recipe): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.recipes.delete, entry.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async updateRating(entry: Recipe, rating: number): Promise<boolean> {
		const request: UpdateRecipeRequest = { rating };
		const res = await this.apiService.update(
			apiRoutes.libraries.recipes.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async importFrom(provider: string, url: string): Promise<RecipeRelease | null> {
		const res = await this.apiService.post(`${apiRoutes.libraries.recipes.import}/${provider}`, { url });
		if (res) return res.data as RecipeRelease;
		return null;
	}
}

const RECIPE_LIBRARY_KEY = Symbol('SOLYTO_RECIPE_LIBRARY');

export function setRecipeLibrary(): RecipeLibrary {
	return setContext(RECIPE_LIBRARY_KEY, new RecipeLibrary());
}

export function getRecipeLibrary(): RecipeLibrary {
	return getContext<RecipeLibrary>(RECIPE_LIBRARY_KEY);
}
