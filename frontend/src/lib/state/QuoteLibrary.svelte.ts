import type { Quote, CreateQuoteRequest, UpdateQuoteRequest } from '$lib/types/library_quote';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';
import type { Book } from '$lib/types/library_book';

export class QuoteLibrary {
	config: LibraryConfig = {
		type: 'quotes',
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
		entriesAreLinks: false
	};
	loaded = $state<boolean>(false);
	entries = $state<Quote[]>([]);
	filteredEntries = $state<Quote[]>([]);
	createModalVisible = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	activeEntry = $state<Quote | null>(null);
	searchTerm = $state<string>('');
	view = $state<'list'>('list');
	auth = getAuth();
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.quotes.list);
		if (res) {
			this.entries = res.data as Quote[];
			this.filteredEntries = this.entries;
			this.loaded = true;
		}
	}

	search(): void {
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'author',
			'quote'
		]);
	}

	openCreateModal(entry?: Quote): void {
		if (entry) this.activeEntry = entry;

		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeEntry = null;
		this.createModalVisible = false;
	}

	openDetailModal(entry: Quote) {
		this.activeEntry = entry;
		this.detailModalVisible = true;
		this.searchVisible = false;
	}

	closeDetailModal(): void {
		this.activeEntry = null;
		this.detailModalVisible = false;
	}

	async create(request: CreateQuoteRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.quotes.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async update(quote: Quote, request: UpdateQuoteRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.libraries.quotes.update,
			quote.id,
			request
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(quote: Quote): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.quotes.delete, quote.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}
}

const BOOK_LIBRARY_KEY = Symbol('SOLYTO_BOOK_LIBRARY');

export function setQuoteLibrary(): QuoteLibrary {
	return setContext(BOOK_LIBRARY_KEY, new QuoteLibrary());
}

export function getQuoteLibrary(): QuoteLibrary {
	return getContext<QuoteLibrary>(BOOK_LIBRARY_KEY);
}
