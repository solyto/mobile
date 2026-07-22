import type {
	FeedSubscription,
	FeedItem,
	CreateFeedSubscriptionRequest,
	UpdateFeedSubscriptionRequest,
	FeedTestItem,
	FeedEntrySize,
	Feed,
	FriendFeed
} from '$lib/types/feed';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Feeds {
	static readonly LS_VIEW_KEY: string = 'feeds_entry_size';
	static readonly LS_IN_LIBRARY_KEY: string = 'feeds_in_library';
	static readonly ITEMS_PER_PAGE = 50;

	loaded = $state<boolean>(false);
	feeds = $state<FeedSubscription[]>([]);
	activeFeed = $state<FeedSubscription | null>(null);
	items = $state<FeedItem[]>([]);
	filteredItems = $state<FeedItem[]>([]);
	hasMore = $state<boolean>(true);
	loadingMore = $state<boolean>(false);
	offset = $state<number>(0);
	feedCounts = $state<Record<string, number>>({});
	modalOpen = $state<boolean>(false);
	browseOpen = $state<boolean>(false);
	view = $state<FeedEntrySize>('compact');
	inLibrary = $state<string[]>([]);
	auth = getAuth();
	apiService: ApiService;
	localStorage = new LocalStorageService();

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
		this.loadView();
	}

	loadView(): void {
		const stored = this.localStorage.get(Feeds.LS_VIEW_KEY);

		if (stored && ['compact', 'comfortable', 'card'].includes(stored)) {
			this.view = stored as FeedEntrySize;
		}
	}

	changeView(size: FeedEntrySize): void {
		this.view = size;
		this.localStorage.set(Feeds.LS_VIEW_KEY, size);
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.feeds.list);

		if (res) {
			this.feeds = res.data as FeedSubscription[];
			this.items = [];
			this.offset = 0;
			this.hasMore = true;

			await this.loadMore();

			this.loaded = true;
			this.loadInLibrary();
		}
	}

	async loadMore(): Promise<void> {
		if (!this.hasMore || this.loadingMore) return;
		this.loadingMore = true;

		const res = await this.apiService.list(
			`${apiRoutes.feeds.listItems}?offset=${this.offset}&limit=${Feeds.ITEMS_PER_PAGE}`
		);

		if (res) {
			const newItems = res.data as FeedItem[];
			this.items = [...this.items, ...newItems];
			this.offset += newItems.length;
			this.hasMore = (res.meta?.has_more as boolean) ?? false;
			this.feedCounts = (res.meta?.feed_counts as Record<string, number>) ?? this.feedCounts;
		}

		this.loadingMore = false;
		this.filter();

		if (this.activeFeed && this.filteredItems.length < Feeds.ITEMS_PER_PAGE && this.hasMore) {
			await this.loadMore();
		}
	}

	filter(): void {
		if (!this.activeFeed) {
			this.filteredItems = [...this.items];
			return;
		}

		this.filteredItems = this.items.filter((item) => item.feed_id === this.activeFeed?.feed_id);
	}

	selectFeed(feed: FeedSubscription | null): void {
		this.activeFeed = feed;
		this.filter();

		if (feed && this.filteredItems.length < Feeds.ITEMS_PER_PAGE && this.hasMore) {
			this.loadMore();
		}
	}

	getFeedCount(feed: FeedSubscription): number {
		return this.feedCounts[feed.feed_id] ?? 0;
	}

	saveToLibrary(feed: FeedSubscription): void {
		if (this.inLibrary.includes(feed.id)) {
			this.inLibrary = this.inLibrary.filter((id) => id !== feed.id);
		} else {
			this.inLibrary.push(feed.id);
		}

		this.storeInLibrary();
	}

	unsaveToLibrary(feed: FeedSubscription): void {
		this.inLibrary = this.inLibrary.filter((id) => id !== feed.id);
		this.storeInLibrary();
	}

	loadInLibrary(): void {
		const stored = this.localStorage.get(Feeds.LS_IN_LIBRARY_KEY);
		this.inLibrary = stored ? stored.split(',') : [];
	}

	isInLibrary(feedId: string): boolean {
		return this.inLibrary.includes(feedId);
	}

	storeInLibrary(): void {
		this.localStorage.set(Feeds.LS_IN_LIBRARY_KEY, this.inLibrary.join(','));
	}

	async create(request: CreateFeedSubscriptionRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.feeds.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async subscribe(
		request: CreateFeedSubscriptionRequest
	): Promise<{ ok: boolean; duplicate: boolean }> {
		const res = await this.apiService.createWithStatus(apiRoutes.feeds.create, request);
		if (res.ok) await this.load();
		return { ok: res.ok, duplicate: res.status === 409 };
	}

	async update(feed: FeedSubscription, request: UpdateFeedSubscriptionRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.feeds.update, feed.id, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(feed: FeedSubscription): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.feeds.delete, feed.id);
		if (res) {
			this.selectFeed(null);
			await this.load();
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	async testFeed(url: string): Promise<FeedTestItem[] | null> {
		const res = await this.apiService.post(apiRoutes.feeds.testFeed, { url });
		if (res) {
			return res.data as FeedTestItem[];
		}
		return null;
	}

	async loadAvailableFeeds(offset: number = 0): Promise<Feed[]> {
		const res = await this.apiService.list(`${apiRoutes.feeds.available}?offset=${offset}`);
		return res ? (res.data as Feed[]) : [];
	}

	async searchFeeds(query: string): Promise<Feed[]> {
		const res = await this.apiService.list(
			`${apiRoutes.feeds.search}?search=${encodeURIComponent(query)}`
		);
		return res ? (res.data as Feed[]) : [];
	}

	async loadFriendFeeds(): Promise<FriendFeed[]> {
		const res = await this.apiService.list(apiRoutes.feeds.friendFeeds);
		return res ? (res.data as FriendFeed[]) : [];
	}
}

const FEEDS_KEY = Symbol('SOLYTO_FEEDS');

export function setFeeds(): Feeds {
	return setContext(FEEDS_KEY, new Feeds());
}

export function getFeeds(): Feeds {
	return getContext<Feeds>(FEEDS_KEY);
}
