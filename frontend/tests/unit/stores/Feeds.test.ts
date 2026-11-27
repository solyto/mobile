import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Feeds } from '$lib/state/Feeds.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import type { FeedItem } from '$lib/types/feed';
import { apiRoutes } from '$lib/config/apiRoutes';
import { feedItem, feedSubscription } from '../helpers/factories';

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
				data: [feedItem({ id: 'a' }), feedItem({ id: 'b' })],
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
			api.list.mockResolvedValue({ data: [feedItem()], meta: {} });

			const s = new Feeds();
			s.feedCounts = { 'feed-1': 3 };
			await s.loadMore();

			expect(s.feedCounts).toEqual({ 'feed-1': 3 });
		});

		it('filters by the active feed on the server and loads one page only', async () => {
			api.list.mockResolvedValue({
				data: [feedItem({ id: 'a' })],
				meta: { has_more: true }
			});

			const s = new Feeds();
			s.activeFeed = feedSubscription();
			await s.loadMore();

			expect(api.list).toHaveBeenCalledTimes(1);
			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('feed_id=feed-1'));
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a']);
		});

		it('drops a response that arrives after load() reset the list', async () => {
			let resolveStale: (value: unknown) => void = () => {};
			api.list
				.mockReturnValueOnce(new Promise((resolve) => (resolveStale = resolve)))
				.mockResolvedValueOnce({ data: [feedSubscription()] })
				.mockResolvedValueOnce({ data: [feedItem({ id: 'fresh' })], meta: { has_more: false } });

			const s = new Feeds();
			s.offset = 100;
			const stale = s.loadMore();
			await s.load();
			resolveStale({ data: [feedItem({ id: 'stale' })], meta: { has_more: true } });
			await stale;

			expect(s.items.map((i) => i.id)).toEqual(['fresh']);
			expect(s.offset).toBe(1);
			expect(s.hasMore).toBe(false);
			expect(s.loadingMore).toBe(false);
		});
	});

	describe('items url', () => {
		const FEED_ID = '9b2f4c1e-3d5a-4e6f-8a7b-1c2d3e4f5a6b';

		it('asks for the first page of all feeds', async () => {
			api.list.mockResolvedValue({ data: [], meta: { has_more: false } });

			await new Feeds().loadMore();

			expect(api.list).toHaveBeenCalledWith(`${apiRoutes.feeds.listItems}?offset=0&limit=50`);
		});

		it('asks for the next page of the active feed', async () => {
			api.list.mockResolvedValue({ data: [], meta: { has_more: false } });
			const s = new Feeds();
			s.activeFeed = feedSubscription({ feed_id: FEED_ID });
			s.offset = 100;

			await s.loadMore();

			expect(api.list).toHaveBeenCalledWith(`${apiRoutes.feeds.listItems}?offset=100&limit=50&feed_id=${FEED_ID}`);
		});
	});

	describe('filter', () => {
		it('shows every item when no feed is active', () => {
			const s = new Feeds();
			s.items = [feedItem({ id: 'a' }), feedItem({ id: 'b', feed_id: 'feed-2' })];
			s.filter();
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a', 'b']);
		});

		it('filters to the active feed only', () => {
			const s = new Feeds();
			s.items = [feedItem({ id: 'a' }), feedItem({ id: 'b', feed_id: 'feed-2' })];
			s.activeFeed = feedSubscription();
			s.filter();
			expect(s.filteredItems.map((i) => i.id)).toEqual(['a']);
		});
	});

	describe('selectFeed', () => {
		it('resets the list and loads the first page of the selected feed', async () => {
			api.list.mockResolvedValue({ data: [feedItem({ id: 'c' })], meta: { has_more: false } });
			const s = new Feeds();
			s.items = [feedItem({ id: 'a' }), feedItem({ id: 'b', feed_id: 'feed-2' })];
			s.offset = 2;
			s.hasMore = false;

			s.selectFeed(feedSubscription());
			await vi.waitFor(() => expect(s.loadingMore).toBe(false));

			expect(s.activeFeed?.feed_id).toBe('feed-1');
			expect(api.list).toHaveBeenCalledTimes(1);
			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/offset=0.*feed_id=feed-1/));
			expect(s.filteredItems.map((i) => i.id)).toEqual(['c']);
		});

		it('loads all feeds again for a null feed', async () => {
			api.list.mockResolvedValue({ data: [feedItem()], meta: { has_more: false } });
			const s = new Feeds();
			s.activeFeed = feedSubscription();

			s.selectFeed(null);
			await vi.waitFor(() => expect(s.loadingMore).toBe(false));

			expect(s.activeFeed).toBeNull();
			expect(api.list).toHaveBeenCalledWith(expect.not.stringContaining('feed_id'));
			expect(s.filteredItems).toHaveLength(1);
		});
	});

	describe('load', () => {
		it('loads subscriptions and resets pagination', async () => {
			api.list.mockResolvedValueOnce({ data: [feedSubscription()] }).mockResolvedValueOnce({
				data: [feedItem()],
				meta: { has_more: false }
			});

			const s = new Feeds();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.feeds).toHaveLength(1);
			expect(s.items).toHaveLength(1);
		});

		it('requests subscriptions and items before either resolves', async () => {
			let resolveFeeds: (value: unknown) => void = () => {};
			api.list
				.mockReturnValueOnce(new Promise((resolve) => (resolveFeeds = resolve)))
				.mockResolvedValueOnce({ data: [feedItem()], meta: { has_more: false } });

			const s = new Feeds();
			const loading = s.load();

			expect(api.list).toHaveBeenCalledTimes(2);
			expect(api.list).toHaveBeenNthCalledWith(2, expect.stringContaining('offset=0'));

			resolveFeeds({ data: [feedSubscription()] });
			await loading;
			expect(s.items).toHaveLength(1);
		});

		it('keeps the current items when the subscriptions request fails', async () => {
			api.list.mockResolvedValueOnce(null).mockResolvedValueOnce({
				data: [feedItem({ id: 'new' })],
				meta: { has_more: false }
			});

			const s = new Feeds();
			s.items = [feedItem({ id: 'old' })];
			await s.load();

			expect(s.items.map((i) => i.id)).toEqual(['old']);
			expect(s.loadingMore).toBe(false);
		});

		it('leaves the store unloaded when the subscriptions request fails', async () => {
			api.list.mockResolvedValue(null);

			const s = new Feeds();
			await s.load();

			expect(s.loaded).toBe(false);
			expect(s.feeds).toEqual([]);
		});
	});

	describe('isEmpty', () => {
		it('is true once loaded with no items to show', () => {
			const s = new Feeds();
			s.loaded = true;
			expect(s.isEmpty).toBe(true);
		});

		it('is false before the first load and while items are loading', () => {
			const s = new Feeds();
			expect(s.isEmpty).toBe(false);

			s.loaded = true;
			s.loadingMore = true;
			expect(s.isEmpty).toBe(false);
		});

		it('is false when there are items to show', () => {
			const s = new Feeds();
			s.loaded = true;
			s.filteredItems = [feedItem()];
			expect(s.isEmpty).toBe(false);
		});
	});

	describe('getFeedCount', () => {
		it('falls back to zero', () => {
			const s = new Feeds();
			s.feedCounts = { 'feed-2': 2 };
			expect(s.getFeedCount(feedSubscription())).toBe(0);
		});
	});

	describe('saved links', () => {
		function storeWith(entry: FeedItem): Feeds {
			const s = new Feeds();
			s.items = [entry];
			s.filter();
			return s;
		}

		it('drops the legacy localStorage flags on construction', () => {
			new Feeds();
			expect(storage.destroy).toHaveBeenCalledWith(Feeds.LS_LEGACY_IN_LIBRARY_KEY);
		});

		it('saveToLibrary creates the link once, keeps its id and does not reload', async () => {
			api.create.mockResolvedValue({ data: { id: 'link-1' } });
			const s = storeWith(feedItem());

			await expect(s.saveToLibrary(s.items[0])).resolves.toBe(true);

			expect(api.create).toHaveBeenCalledTimes(1);
			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/libraries/links'), {
				title: 'An item',
				url: 'https://example.com/item-1',
				category_id: null
			});
			expect(api.list).not.toHaveBeenCalled();
			expect(s.items[0].saved_link_id).toBe('link-1');
			expect(s.filteredItems[0].saved_link_id).toBe('link-1');
		});

		it('saveToLibrary leaves the item unsaved when the create fails', async () => {
			api.create.mockResolvedValue(null);
			const s = storeWith(feedItem());

			await expect(s.saveToLibrary(s.items[0])).resolves.toBe(false);
			expect(s.items[0].saved_link_id).toBeNull();
		});

		it('unsaveFromLibrary deletes the stored link id and does not reload', async () => {
			api.deleteWithStatus.mockResolvedValue({ ok: true, status: 204, errors: [] });
			const s = storeWith(feedItem({ saved_link_id: 'link-1' }));

			await expect(s.unsaveFromLibrary(s.items[0])).resolves.toBe(true);

			expect(api.deleteWithStatus).toHaveBeenCalledWith(`${apiRoutes.libraries.links.list}/link-1`);
			expect(api.list).not.toHaveBeenCalled();
			expect(s.items[0].saved_link_id).toBeNull();
			expect(s.filteredItems[0].saved_link_id).toBeNull();
		});

		it.each([404, 403])('unsaveFromLibrary treats %d as already gone', async (status) => {
			api.deleteWithStatus.mockResolvedValue({ ok: false, status, errors: [] });
			const s = storeWith(feedItem({ saved_link_id: 'link-1' }));

			await expect(s.unsaveFromLibrary(s.items[0])).resolves.toBe(true);
			expect(s.items[0].saved_link_id).toBeNull();
		});

		it('unsaveFromLibrary keeps the link id when the delete fails otherwise', async () => {
			api.deleteWithStatus.mockResolvedValue({ ok: false, status: 500, errors: [] });
			const s = storeWith(feedItem({ saved_link_id: 'link-1' }));

			await expect(s.unsaveFromLibrary(s.items[0])).resolves.toBe(false);
			expect(s.items[0].saved_link_id).toBe('link-1');
		});

		it('unsaveFromLibrary does nothing for an unsaved item', async () => {
			const s = storeWith(feedItem());

			await expect(s.unsaveFromLibrary(s.items[0])).resolves.toBe(false);
			expect(api.deleteWithStatus).not.toHaveBeenCalled();
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
			api.list.mockResolvedValue({ data: [feedSubscription()], meta: {} });
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
			api.list.mockResolvedValue({ data: [feedSubscription()] });
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

	describe('delete', () => {
		it('clears the active feed and reloads with a single items request', async () => {
			api.delete.mockResolvedValue(true);
			api.list.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
				data: [feedItem()],
				meta: { has_more: false }
			});

			const s = new Feeds();
			s.activeFeed = feedSubscription();
			await expect(s.delete(feedSubscription())).resolves.toBe(true);

			expect(s.activeFeed).toBeNull();
			expect(api.list).toHaveBeenCalledTimes(2);
			expect(api.list).toHaveBeenNthCalledWith(2, expect.stringMatching(/offset=0&limit=50$/));
		});
	});

	describe('update', () => {
		it('returns false and does not reload when the server rejects the update', async () => {
			api.update.mockResolvedValue(false);
			const s = new Feeds();
			const load = vi.spyOn(s, 'load').mockResolvedValue();

			await expect(s.update(feedSubscription(), { title: 'New' })).resolves.toBe(false);
			expect(load).not.toHaveBeenCalled();
		});

		it('returns true and reloads after a successful update', async () => {
			api.update.mockResolvedValue(true);
			const s = new Feeds();
			const load = vi.spyOn(s, 'load').mockResolvedValue();

			await expect(s.update(feedSubscription(), { title: 'New' })).resolves.toBe(true);
			expect(load).toHaveBeenCalled();
		});
	});
});
