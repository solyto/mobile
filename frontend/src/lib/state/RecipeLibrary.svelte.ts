import type {
	Recipe,
	RecipeType,
	CreateRecipeRequest,
	UpdateRecipeRequest,
	RecipeRelease
} from '$lib/types/library_recipe';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';

export class RecipeLibrary {
	static readonly LS_VIEW_KEY: string = 'recipes_view';
	static readonly VIEWS = ['list', 'cards'] as const;

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
		entriesAreLinks: false,
		hasSmallForm: false
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
	activeFilter: 'none' | 'search' | 'ratingAndType' = 'none';
	view = $state<(typeof RecipeLibrary.VIEWS)[number]>('cards');
	auth: Auth;
	filterService = new LibraryFilterService();
	apiService: ApiService;
	localStorage: LocalStorageService;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.recipes.list);
		if (res) {
			this.entries = res.data as Recipe[];
			this.reapplyFilter();
			this.loaded = true;
		}
	}

	search(): void {
		this.ratingFilter = null;
		this.activeFilter = 'search';
		this.reapplyFilter();
	}

	filter(): void {
		this.activeFilter = 'ratingAndType';
		this.reapplyFilter();
	}

	addRatingFilter(rating: number | null): void {
		this.ratingFilter = rating;
		this.filter();
	}

	addTypeFilter(type: RecipeType | null): void {
		this.typeFilter = type;
		this.filter();
	}

	clearFilters(): void {
		this.ratingFilter = null;
		this.typeFilter = null;
		this.activeFilter = 'none';
		this.reapplyFilter();
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

	changeView(view: string): void {
		const known = RecipeLibrary.VIEWS.find((candidate) => candidate === view);
		if (!known) return;
		this.view = known;
		this.localStorage.set(RecipeLibrary.LS_VIEW_KEY, known);
	}

	switchView(): void {
		this.view = this.view === 'list' ? 'cards' : 'list';
	}

	async create(request: CreateRecipeRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.recipes.create, request);
		if (res) await this.load();
		return res !== null;
	}

	async update(entry: Recipe, request: UpdateRecipeRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.recipes.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return res;
	}

	async delete(entry: Recipe): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.recipes.delete, entry.id);
		if (res) await this.load();
		return res;
	}

	async updateRating(entry: Recipe, rating: number): Promise<boolean> {
		const request: UpdateRecipeRequest = { rating };
		const res = await this.apiService.update(
			apiRoutes.libraries.recipes.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return res;
	}

	async importFrom(provider: string, url: string): Promise<RecipeRelease | null> {
		const res = await this.apiService.post(
			`${apiRoutes.libraries.recipes.import}/${provider}`,
			{ url }
		);
		if (res) return res.data as RecipeRelease;
		return null;
	}

	private reapplyFilter(): void {
		this.filteredEntries = this.filterEntries();
	}

	private filterEntries(): Recipe[] {
		switch (this.activeFilter) {
			case 'search':
				return this.searchEntries();
			case 'ratingAndType':
				return this.filterService.byType(this.filterService.byRating(this.entries, this.ratingFilter), this.typeFilter);
			default:
				return this.entries;
		}
	}

	private searchEntries(): Recipe[] {
		const term = this.searchTerm.trim().toLowerCase();
		if (term.length === 0) return this.entries;

		return this.entries.filter((entry) => entry.title.toLowerCase().includes(term) || this.hasIngredient(entry, term));
	}

	private hasIngredient(entry: Recipe, term: string): boolean {
		return entry.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(term));
	}
}

const RECIPE_LIBRARY_KEY = Symbol('SOLYTO_RECIPE_LIBRARY');

export function setRecipeLibrary(): RecipeLibrary {
	return setContext(RECIPE_LIBRARY_KEY, new RecipeLibrary());
}

export function getRecipeLibrary(): RecipeLibrary {
	return getContext<RecipeLibrary>(RECIPE_LIBRARY_KEY);
}
