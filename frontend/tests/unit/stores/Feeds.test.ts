import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Feeds } from '$lib/state/Feeds.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import type { FeedSubscription, FeedItem } from '$lib/types/feed';

function feed(overrides: Partial<FeedSubscription> = {}): FeedSubscription {
	return {
		id: 'sub-1',
		feed_id: 'feed-1',
		title: 'My Feed',
		url: 'https://example.com/rss',
		whitelist: '',
		blacklist: '',
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function item(overrides: Partial<FeedItem> = {}): FeedItem {
	return {
		id: 'item-1',
		title: 'An item',
		description: '',
		image_url: null,
		feed_id: 'feed-1',
		link: 'https://example.com/item-1',
		published_at: '2026-08-01T10:00:00Z',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Feeds store', () => {
	describe('view persistence', () => {
		it('defaults to compact when nothing is stored', () => {
			const s = new Feeds();
			expect(s.view).toBe('compact');
		});

		it('loads a stored view in the constructor', () => {
			storage.get.mockReturnValue('card');
			const s = new Feeds();
			expect(s.view).toBe('card');
		});

		it('ignores invalid stored values', () => {
			storage.get.mockReturnValue('huge');
			const s = new Feeds();
			expect(s.view).toBe('compact');
		});

		it('changeView updates the state and persists it', () => {
			const s = new Feeds();
			s.changeView('comfortable');
			expect(s.view).toBe('comfortable');
			expect(storage.set).toHaveBeenCalledWith(Feeds.LS_VIEW_KEY, 'comfortable');
		});
	});

	describe('loadMore pagination', () => {
		it('appends items, advances the offset and tracks hasMore from the meta', async () => {
			api.list.mockResolvedValue({
				data: [item({ id: 'a' }), item({ id: 'b' })],
				meta: { has_more: true, feed_counts: { 'feed-1': 5 } }
			});

			const s = new Feeds();
			await s.loadMore();

			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
			expect(s.items.map((i) => i.id)).toEqual(['a', 'b']);
			expect(s.offset).toBe(2);
			expect(s.hasMore).toBe(true);
			expect(s.feedCounts).toEqual({ 'feed-1': 5 });
		});

		it('stops when hasMore is false', async () => {
			api.list.mockResolvedValue({ data: [], meta: { has_more: false } });

			const s = new Feeds();
			s.hasMore = false;
			await s.loadMore();

			expect(api.list).not.toHaveBeenCalled();
		});

		it('does not recurse while already loading', async () => {
			const s = new Feeds();
			s.loadingMore = true;
			await s.loadMore();
			expect(api.list).not.toHaveBeenCalled();
		});

		it('keeps the previous feed counts when the meta omits them', async () => {
			api.list.mockResolvedValue({ data: [item()], meta: {} });

			const s = new Feeds();
			s.feedCounts = { 'feed-1': 3 };
			await s.loadMore();

			expect(s.feedCounts).toEqual({ 'feed-1': 3 });
		});

		it('filters by the active feed on the server and loads one page only', async () => {
			api.list.mockResolvedValue({
				data: [item({ id: 'a' })],
				meta: { has_more: true }
			});

			const s = new Feeds();
			s.activeFeed = feed();
			await s.loadMore();

			expect(api.list).toHaveBeenCalledTimes(1);
			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('feed_id=feed-1'));
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a']);
		});

		it('drops a response that arrives after load() reset the list', async () => {
			let resolveStale: (value: unknown) => void = () => {};
			api.list
				.mockReturnValueOnce(new Promise((resolve) => (resolveStale = resolve)))
				.mockResolvedValueOnce({ data: [feed()] })
				.mockResolvedValueOnce({ data: [item({ id: 'fresh' })], meta: { has_more: false } });

			const s = new Feeds();
			s.offset = 100;
			const stale = s.loadMore();
			await s.load();
			resolveStale({ data: [item({ id: 'stale' })], meta: { has_more: true } });
			await stale;

			expect(s.items.map((i) => i.id)).toEqual(['fresh']);
			expect(s.offset).toBe(1);
			expect(s.hasMore).toBe(false);
			expect(s.loadingMore).toBe(false);
		});
	});

	describe('filter', () => {
		it('shows every item when no feed is active', () => {
			const s = new Feeds();
			s.items = [item({ id: 'a' }), item({ id: 'b', feed_id: 'feed-2' })];
			s.filter();
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a', 'b']);
		});

		it('filters to the active feed only', () => {
			const s = new Feeds();
			s.items = [item({ id: 'a' }), item({ id: 'b', feed_id: 'feed-2' })];
			s.activeFeed = feed();
			s.filter();
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a']);
		});
	});

	describe('selectFeed', () => {
		it('resets the list and loads the first page of the selected feed', async () => {
			api.list.mockResolvedValue({ data: [item({ id: 'c' })], meta: { has_more: false } });
			const s = new Feeds();
			s.items = [item({ id: 'a' }), item({ id: 'b', feed_id: 'feed-2' })];
			s.offset = 2;
			s.hasMore = false;

			s.selectFeed(feed());
			await vi.waitFor(() => expect(s.loadingMore).toBe(false));

			expect(s.activeFeed?.feed_id).toBe('feed-1');
			expect(api.list).toHaveBeenCalledTimes(1);
			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/offset=0.*feed_id=feed-1/));
			expect(s.filteredItems.map((i) => i.id)).toEqual(['c']);
		});

		it('loads all feeds again for a null feed', async () => {
			api.list.mockResolvedValue({ data: [item()], meta: { has_more: false } });
			const s = new Feeds();
			s.activeFeed = feed();

			s.selectFeed(null);
			await vi.waitFor(() => expect(s.loadingMore).toBe(false));

			expect(s.activeFeed).toBeNull();
			expect(api.list).toHaveBeenCalledWith(expect.not.stringContaining('feed_id'));
			expect(s.filteredItems).toHaveLength(1);
		});
	});

	describe('load', () => {
		it('loads subscriptions, resets pagination and loads the library flags', async () => {
			api.list.mockResolvedValueOnce({ data: [feed()] }).mockResolvedValueOnce({
				data: [item()],
				meta: { has_more: false }
			});
			storage.get.mockReturnValue('sub-1');

			const s = new Feeds();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.feeds).toHaveLength(1);
			expect(s.items).toHaveLength(1);
			expect(s.inLibrary).toEqual(['sub-1']);
		});

		it('leaves the store unloaded when the subscriptions request fails', async () => {
			api.list.mockResolvedValue(null);

			const s = new Feeds();
			await s.load();

			expect(s.loaded).toBe(false);
			expect(s.feeds).toEqual([]);
		});
	});

	describe('library flags', () => {
		it('getFeedCount falls back to zero', () => {
			const s = new Feeds();
			s.feedCounts = { 'feed-2': 2 };
			expect(s.getFeedCount(feed())).toBe(0);
		});

		it('saveToLibrary toggles membership and persists', () => {
			const s = new Feeds();
			s.saveToLibrary(item({ id: 'sub-1' }));
			expect(s.isInLibrary('sub-1')).toBe(true);
			expect(storage.set).toHaveBeenCalledWith(Feeds.LS_IN_LIBRARY_KEY, 'sub-1');

			s.saveToLibrary(item({ id: 'sub-1' }));
			expect(s.isInLibrary('sub-1')).toBe(false);
			expect(storage.set).toHaveBeenCalledWith(Feeds.LS_IN_LIBRARY_KEY, '');
		});

		it('unsaveToLibrary removes the id', () => {
			const s = new Feeds();
			s.inLibrary = ['sub-1', 'sub-2'];
			s.unsaveToLibrary(item({ id: 'sub-1' }));
			expect(s.inLibrary).toEqual(['sub-2']);
		});

		it('loadInLibrary splits the stored csv', () => {
			storage.get.mockReturnValue('sub-1,sub-2');
			const s = new Feeds();
			s.loadInLibrary();
			expect(s.inLibrary).toEqual(['sub-1', 'sub-2']);
		});
	});

	describe('subscribe', () => {
		it('reports duplicates via the 409 status', async () => {
			api.createWithStatus.mockResolvedValue({ ok: false, status: 409 });
			const s = new Feeds();
			await expect(s.subscribe({ title: 'X', url: 'https://x.com/rss' })).resolves.toEqual({
				ok: false,
				duplicate: true
			});
		});

		it('reloads the feeds on success', async () => {
			api.createWithStatus.mockResolvedValue({ ok: true, status: 201 });
			api.list.mockResolvedValue({ data: [feed()], meta: {} });
			const s = new Feeds();
			await s.subscribe({ title: 'X', url: 'https://x.com/rss' });
			expect(s.feeds).toHaveLength(1);
		});
	});

	describe('feeds API helpers', () => {
		it('testFeed returns the parsed items', async () => {
			api.post.mockResolvedValue({
				data: [{ id: 't1', title: 'T', link: 'https://x.com', published_at: '' }]
			});
			const s = new Feeds();
			await expect(s.testFeed('https://x.com/rss')).resolves.toHaveLength(1);
		});

		it('testFeed returns null when the request fails', async () => {
			api.post.mockResolvedValue(null);
			const s = new Feeds();
			await expect(s.testFeed('https://x.com/rss')).resolves.toBeNull();
		});

		it('loadAvailableFeeds returns an empty array when the request fails', async () => {
			api.list.mockResolvedValue(null);
			const s = new Feeds();
			await expect(s.loadAvailableFeeds()).resolves.toEqual([]);
		});

		it('searchFeeds encodes the query', async () => {
			api.list.mockResolvedValue({ data: [feed()] });
			const s = new Feeds();
			await s.searchFeeds('a b');
			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('search=a%20b'));
		});

		it('loadFriendFeeds returns an empty array when the request fails', async () => {
			api.list.mockResolvedValue(null);
			const s = new Feeds();
			await expect(s.loadFriendFeeds()).resolves.toEqual([]);
		});
	});

	describe('update', () => {
		it('returns false and does not reload when the server rejects the update', async () => {
			api.update.mockResolvedValue(false);
			const s = new Feeds();
			const load = vi.spyOn(s, 'load').mockResolvedValue();

			await expect(s.update(feed(), { title: 'New' })).resolves.toBe(false);
			expect(load).not.toHaveBeenCalled();
		});

		it('returns true and reloads after a successful update', async () => {
			api.update.mockResolvedValue(true);
			const s = new Feeds();
			const load = vi.spyOn(s, 'load').mockResolvedValue();

			await expect(s.update(feed(), { title: 'New' })).resolves.toBe(true);
			expect(load).toHaveBeenCalled();
		});
	});
});
