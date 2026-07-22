import type {
	Game,
	GameGenre,
	CreateGameRequest,
	UpdateGameRequest,
	CreateGameGenreRequest,
	GameRelease,
	GameSearchResult
} from '$lib/types/library_game';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';

export class GameLibrary {
	config: LibraryConfig = {
		type: 'games',
		hasCovers: true,
		hasRatings: true,
		hasViewSwitcher: true,
		hasFilters: true,
		hasGenres: true,
		hasRecommender: false,
		hasWishlist: true,
		hasExternalLinks: true,
		hasReleases: false,
		hasShelf: false,
		entriesAreLinks: false
	};
	loaded = $state<boolean>(false);
	entries = $state<Game[]>([]);
	filteredEntries = $state<Game[]>([]);
	genres = $state<GameGenre[]>([]);
	createModalVisible = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	genreModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	externalSearchModalVisible = $state<boolean>(false);
	activeEntry = $state<Game | null>(null);
	ratingFilter = $state<number | null>(null);
	genreFilter = $state<GameGenre | null>(null);
	wishlistFilter = $state<boolean>(false);
	searchTerm = $state<string>('');
	view = $state<'list' | 'cards'>('cards');
	auth = getAuth();
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.games.list);
		if (res) {
			this.entries = res.data as Game[];
			this.filteredEntries = this.entries;
			await this.loadGenres();
			this.loaded = true;
		}
	}

	async loadGenres(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.games.listGenres);
		if (res) {
			this.genres = res.data as GameGenre[];
		}
	}

	search(): void {
		this.genreFilter = null;
		this.ratingFilter = null;
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'title',
			'developer',
			'publisher'
		]);
	}

	filterByGenreAndRating(): void {
		this.filteredEntries = this.filterService.byGenreAndRating(
			this.entries,
			this.genreFilter,
			this.ratingFilter
		);
	}

	filterByWishlist(): void {
		this.wishlistFilter = true;
		this.filteredEntries = this.filterService.byWishlist(this.entries);
	}

	clearFilters(): void {
		this.genreFilter = null;
		this.ratingFilter = null;
		this.wishlistFilter = false;
		this.filteredEntries = this.entries;
	}

	addRatingFilter(rating: number | null): void {
		this.ratingFilter = rating;
		this.filterByGenreAndRating();
	}

	addGenreFilter(genre: GameGenre | null): void {
		this.genreFilter = genre;
		this.filterByGenreAndRating();
	}

	openCreateModal(entry?: Game): void {
		if (entry) this.activeEntry = entry;

		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeEntry = null;
		this.createModalVisible = false;
	}

	openDetailModal(entry: Game) {
		this.activeEntry = entry;
		this.detailModalVisible = true;
		this.searchVisible = false;
	}

	closeDetailModal(): void {
		this.detailModalVisible = false;
		this.activeEntry = null;
	}

	openGenreModal(): void {
		this.genreModalVisible = true;
		this.searchVisible = false;
	}

	closeGenreModal(): void {
		this.genreModalVisible = false;
	}

	openExternalSearchModal(): void {
		this.externalSearchModalVisible = true;
	}

	closeExternalSearchModal(): void {
		this.externalSearchModalVisible = false;
	}

	switchView(): void {
		this.view = this.view === 'list' ? 'cards' : 'list';
	}

	async create(request: CreateGameRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.games.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async update(entry: Game, request: UpdateGameRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.games.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(entry: Game): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.games.delete, entry.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async updateRating(entry: Game, rating: number): Promise<boolean> {
		const request: UpdateGameRequest = { rating };
		const res = await this.apiService.update(
			apiRoutes.libraries.games.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async createGenre(title: string): Promise<GameGenre | null> {
		const request: CreateGameGenreRequest = { title };
		const res = await this.apiService.create(apiRoutes.libraries.games.createGenre, request);
		if (res) await this.loadGenres();
		return res ? (res.data as GameGenre) : null;
	}

	async deleteGenre(genre: GameGenre): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.games.deleteGenre, genre.id);
		if (res) await this.loadGenres();
		return Promise.resolve(res !== null);
	}

	async searchAt(provider: string, query: string): Promise<GameSearchResult[] | null> {
		const res = await this.apiService.list(
			`${apiRoutes.libraries.games.search}/${provider}/${encodeURIComponent(query)}`
		);
		if (res) return res.data as GameSearchResult[];
		return null;
	}

	async importFrom(provider: string, url: string): Promise<GameRelease | null> {
		const res = await this.apiService.post(
			`${apiRoutes.libraries.games.import}/${provider}`,
			{ url }
		);
		if (res) return res.data as GameRelease;
		return null;
	}
}

const GAME_LIBRARY_KEY = Symbol('SOLYTO_GAME_LIBRARY');

export function setGameLibrary(): GameLibrary {
	return setContext(GAME_LIBRARY_KEY, new GameLibrary());
}

export function getGameLibrary(): GameLibrary {
	return getContext<GameLibrary>(GAME_LIBRARY_KEY);
}
