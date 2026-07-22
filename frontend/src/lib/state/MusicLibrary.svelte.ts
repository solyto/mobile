import type {
	Music,
	MusicGenre,
	CreateMusicRequest,
	UpdateMusicRequest,
	CreateMusicGenreRequest,
	MusicRelease,
	MusicSearchResult
} from '$lib/types/library_music';
import type {
	LibraryRecommendation,
	LibraryRecommendationType,
	LibraryConfig
} from '$lib/types/library';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import LocalStorageService from '$lib/services/LocalStorageService';

export class MusicLibrary {
	static readonly LS_VIEW_KEY: string = 'music_view';

	config: LibraryConfig = {
		type: 'music',
		hasCovers: true,
		hasRatings: true,
		hasViewSwitcher: true,
		hasFilters: true,
		hasGenres: true,
		hasRecommender: true,
		hasWishlist: true,
		hasExternalLinks: true,
		hasReleases: true,
		hasShelf: true,
		entriesAreLinks: false
	};
	loaded = $state<boolean>(false);
	entries = $state<Music[]>([]);
	filteredEntries = $state<Music[]>([]);
	genres = $state<MusicGenre[]>([]);
	createModalVisible = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	genreModalVisible = $state<boolean>(false);
	externalSearchModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	activeEntry = $state<Music | null>(null);
	ratingFilter = $state<number | null>(null);
	genreFilter = $state<MusicGenre | null>(null);
	wishlistFilter = $state<boolean>(false);
	searchTerm = $state<string>('');
	releases = $state<MusicRelease[]>([]);
	releasesLoaded = $state<boolean>(false);
	view = $state<'list' | 'cards' | 'shelf' | 'spine'>('cards');
	auth = getAuth();
	apiService: ApiService;
	localStorage = new LocalStorageService();
	filterService = new LibraryFilterService();

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());

		const saved = this.localStorage.get(MusicLibrary.LS_VIEW_KEY);
		this.view = (saved as 'list' | 'cards' | 'shelf' | 'spine' | null) ?? 'cards';
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.music.list);
		if (res) {
			this.entries = res.data as Music[];
			this.filteredEntries = this.entries;
			await this.loadGenres();
			this.loaded = true;
		}
	}

	async loadGenres(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.music.listGenres);
		if (res) {
			this.genres = res.data as MusicGenre[];
		}
	}

	async loadReleases(): Promise<boolean> {
		const res = await this.apiService.list(apiRoutes.libraries.music.releases);
		if (res) this.releases = res.data as MusicRelease[];
		this.releasesLoaded = true;
		return Promise.resolve(res !== null);
	}

	search(): void {
		this.genreFilter = null;
		this.ratingFilter = null;
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'title',
			'artist'
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

	async recommend(type: LibraryRecommendationType): Promise<LibraryRecommendation | null> {
		const res = await this.apiService.get(apiRoutes.libraries.music.recommend, type);
		if (res) return res.data as LibraryRecommendation;
		return null;
	}

	addRatingFilter(rating: number | null): void {
		this.ratingFilter = rating;
		this.filterByGenreAndRating();
	}

	addGenreFilter(genre: MusicGenre | null): void {
		this.genreFilter = genre;
		this.filterByGenreAndRating();
	}

	openCreateModal(entry?: Music): void {
		if (entry) this.activeEntry = entry;

		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeEntry = null;
		this.createModalVisible = false;
	}

	openExternalSearchModal(): void {
		this.externalSearchModalVisible = true;
	}

	closeExternalSearchModal(): void {
		this.externalSearchModalVisible = false;
	}

	openDetailModal(entry: Music) {
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

	switchView(): void {
		if (this.view === 'list') this.view = 'cards';
		else if (this.view === 'cards') this.view = 'shelf';
		else this.view = 'list';
	}

	async create(request: CreateMusicRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.music.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async update(entry: Music, request: UpdateMusicRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.music.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(entry: Music): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.music.delete, entry.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async updateRating(entry: Music, rating: number): Promise<boolean> {
		const request: UpdateMusicRequest = { rating };
		const res = await this.apiService.update(
			apiRoutes.libraries.music.update,
			entry.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async createGenre(title: string): Promise<MusicGenre | null> {
		const request: CreateMusicGenreRequest = { title };
		const res = await this.apiService.create(apiRoutes.libraries.music.createGenre, request);
		if (res) await this.loadGenres();
		return res ? (res.data as MusicGenre) : null;
	}

	async deleteGenre(genre: MusicGenre): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.music.deleteGenre, genre.id);
		if (res) await this.loadGenres();
		return Promise.resolve(res !== null);
	}

	async searchAt(provider: string, query: string): Promise<MusicSearchResult[] | null> {
		const res = await this.apiService.list(
			`${apiRoutes.libraries.music.search}/${provider}/${encodeURIComponent(query)}`
		);
		if (res) return res.data as MusicSearchResult[];
		return null;
	}

	async importFrom(provider: string, url: string): Promise<MusicRelease | null> {
		const res = await this.apiService.post(
			`${apiRoutes.libraries.music.import}/${provider}`,
			{ url }
		);
		if (res) return res.data as MusicRelease;
		return null;
	}
}

const MUSIC_LIBRARY_KEY = Symbol('SOLYTO_MUSIC_LIBRARY');

export function setMusicLibrary(): MusicLibrary {
	return setContext(MUSIC_LIBRARY_KEY, new MusicLibrary());
}

export function getMusicLibrary(): MusicLibrary {
	return getContext<MusicLibrary>(MUSIC_LIBRARY_KEY);
}
