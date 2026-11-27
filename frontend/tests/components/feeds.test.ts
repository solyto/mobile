import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import type { Feeds } from '$lib/state/Feeds.svelte';
import type { FeedImport } from '$lib/state/FeedImport.svelte';
import { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { Feed, FriendFeed } from '$lib/types/feed';
import { formatDateTime } from '$lib/helpers/DateHelper';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import FeedsHarness from './helpers/FeedsHarness.svelte';
import { feedItem, feedSubscription } from '../unit/helpers/factories';
import FeedView from '$lib/components/feeds/FeedView.svelte';
import FeedNavigation from '$lib/components/feeds/FeedNavigation.svelte';
import Header from '$lib/components/feeds/Header.svelte';
import CardEntry from '$lib/components/feeds/CardEntry.svelte';
import ComfortableEntry from '$lib/components/feeds/ComfortableEntry.svelte';
import CompactEntry from '$lib/components/feeds/CompactEntry.svelte';
import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';
import EntryEdit from '$lib/components/feeds/EntryEdit.svelte';
import FeedBrowserModal from '$lib/components/feeds/FeedBrowserModal.svelte';

type Setup = (feeds: Feeds, feedImport: FeedImport) => void;

function renderFeeds(component: Component<never>, props: Record<string, unknown> = {}, setup: Setup = () => {}): { feeds: Feeds; feedImport: FeedImport } {
	let stores: { feeds: Feeds; feedImport: FeedImport } | null = null;
	renderWithContext(FeedsHarness, {
		component,
		props,
		setup: (feeds: Feeds, feedImport: FeedImport) => {
			setup(feeds, feedImport);
			stores = { feeds, feedImport };
		}
	});
	return stores!;
}

function buttonWithText(text: string): HTMLButtonElement {
	return screen.getByText(text).closest('button')!;
}

afterEach(() => {
	vi.useRealTimers();
});

describe('FeedView', () => {
	it('asks for a first feed when there are no subscriptions', () => {
		renderFeeds(FeedView as Component<never>, {}, (feeds) => (feeds.loaded = true));

		expect(screen.getByText(en.feeds.no_feeds)).toBeInTheDocument();
		expect(screen.queryByText(en.feeds.no_items)).toBeNull();
	});

	it('says there is nothing yet when the subscriptions have no items', () => {
		renderFeeds(FeedView as Component<never>, {}, (feeds) => {
			feeds.loaded = true;
			feeds.feeds = [feedSubscription()];
		});

		expect(screen.getByText(en.feeds.no_items)).toBeInTheDocument();
	});

	it.each([
		['before the first load', (feeds: Feeds) => (feeds.loaded = false)],
		['while items are loading', (feeds: Feeds) => ((feeds.loaded = true), (feeds.loadingMore = true))]
	])('shows no empty state %s', (_, setup) => {
		renderFeeds(FeedView as Component<never>, {}, setup);

		expect(screen.queryByText(en.feeds.no_feeds)).toBeNull();
		expect(screen.queryByText(en.feeds.no_items)).toBeNull();
	});

	it.each(['compact', 'comfortable', 'card'] as const)('renders one link per item in the %s view', (view) => {
		renderFeeds(FeedView as Component<never>, {}, (feeds) => {
			feeds.loaded = true;
			feeds.view = view;
			feeds.feeds = [feedSubscription()];
			feeds.filteredItems = [feedItem({ id: 'a', title: 'First' }), feedItem({ id: 'b', title: 'Second' })];
		});

		expect(screen.getAllByRole('link')).toHaveLength(2);
		expect(screen.getByText('First')).toBeInTheDocument();
		expect(screen.getByText('Second')).toBeInTheDocument();
	});
});

describe('Feed entries', () => {
	const item = feedItem({ title: 'Story', link: 'https://example.com/story' });

	it.each([
		['card', CardEntry],
		['comfortable', ComfortableEntry],
		['compact', CompactEntry]
	])('the %s entry links to the item and shows its source, date and save button', (_, entry) => {
		renderFeeds(entry as Component<never>, { item, source: 'My Feed' });

		expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/story');
		expect(screen.getByText('Story')).toBeInTheDocument();
		expect(screen.getByText('My Feed')).toBeInTheDocument();
		expect(screen.getByText(formatDateTime(new Date(item.published_at)))).toBeInTheDocument();
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('renders an item without a safe link as plain content', () => {
		renderFeeds(CardEntry as Component<never>, { item: feedItem({ link: 'javascript:alert(1)' }), source: 'My Feed' });

		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.getByText('An item')).toBeInTheDocument();
	});
});

describe('SaveToLibraryButton', () => {
	it('saves an unsaved item without following the surrounding link', async () => {
		const item = feedItem();
		const { feeds } = renderFeeds(SaveToLibraryButton as Component<never>, { item }, (feeds) => {
			vi.spyOn(feeds, 'saveToLibrary').mockResolvedValue(true);
		});

		const followed = await fireEvent.click(screen.getByRole('button'));

		expect(followed).toBe(false);
		expect(feeds.saveToLibrary).toHaveBeenCalledWith(item);
	});

	it('removes a saved item from the library', () => {
		const item = feedItem({ saved_link_id: 'link-1' });
		const { feeds } = renderFeeds(SaveToLibraryButton as Component<never>, { item }, (feeds) => {
			vi.spyOn(feeds, 'unsaveFromLibrary').mockResolvedValue(true);
		});

		fireEvent.click(screen.getByRole('button'));

		expect(feeds.unsaveFromLibrary).toHaveBeenCalledWith(item);
	});
});

describe('FeedNavigation', () => {
	const subscription = feedSubscription();

	function renderNavigation(setup: Setup = () => {}): { feeds: Feeds; feedImport: FeedImport } {
		return renderFeeds(FeedNavigation as Component<never>, {}, (feeds, feedImport) => {
			feeds.feeds = [subscription];
			vi.spyOn(feeds, 'selectFeed').mockImplementation(() => {});
			setup(feeds, feedImport);
		});
	}

	it('selects all feeds or a single feed', async () => {
		const { feeds } = renderNavigation();

		await fireEvent.click(buttonWithText(en.feeds.all_feeds));
		expect(feeds.selectFeed).toHaveBeenLastCalledWith(null);

		await fireEvent.click(buttonWithText('My Feed'));
		expect(feeds.selectFeed).toHaveBeenLastCalledWith(subscription);
	});

	it('opens the add, browse and import dialogs', async () => {
		const { feeds, feedImport } = renderNavigation();

		await fireEvent.click(buttonWithText(en.feeds.add_feed));
		await fireEvent.click(buttonWithText(en.feeds.browse_feeds));
		await fireEvent.click(buttonWithText(en.feeds.import_opml));

		expect(feeds.modalOpen).toBe(true);
		expect(feeds.browseOpen).toBe(true);
		expect(feedImport.modalOpen).toBe(true);
	});

	it('hides the opened mobile navigation again once an entry is chosen', async () => {
		renderNavigation();
		const navigation = screen.getByText(en.feeds.all_feeds).closest<HTMLElement>('.secondary-nav-mobile-container')!;

		await fireEvent.click(screen.getAllByRole('button')[0]);
		expect(navigation.style.display).toBe('block');

		await fireEvent.click(buttonWithText(en.feeds.add_feed));
		expect(navigation.style.display).toBe('none');
	});

	it('announces a running import on the import button', () => {
		renderNavigation((_, feedImport) => (feedImport.polling = true));

		expect(buttonWithText(en.feeds.import_opml)).toHaveTextContent(en.feeds.import_in_progress);
	});
});

describe('Feeds Header', () => {
	const subscription = feedSubscription();

	it('names all feeds and offers no edit or delete without a feed', () => {
		renderFeeds(Header as Component<never>, { feed: null });

		expect(screen.getByText(en.feeds.all_feeds)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: en.feeds.edit_feed })).toBeNull();
		expect(screen.queryByRole('button', { name: en.feeds.delete_feed })).toBeNull();
	});

	it('opens the edit dialog for the feed', async () => {
		const { feeds } = renderFeeds(Header as Component<never>, { feed: subscription });

		await fireEvent.click(screen.getByRole('button', { name: en.feeds.edit_feed }));

		expect(feeds.modalOpen).toBe(true);
	});

	it('deletes the feed only after confirmation', async () => {
		const { feeds } = renderFeeds(Header as Component<never>, { feed: subscription }, (feeds) => {
			vi.spyOn(feeds, 'delete').mockResolvedValue(true);
		});

		await fireEvent.click(screen.getByRole('button', { name: en.feeds.delete_feed }));
		expect(screen.getByText(en.feeds.delete_feed_description)).toBeInTheDocument();
		expect(feeds.delete).not.toHaveBeenCalled();

		await fireEvent.click(screen.getByRole('button', { name: en.layout.modal_confirm }));

		await vi.waitFor(() => expect(screen.queryByText(en.feeds.delete_feed_description)).toBeNull());
		expect(feeds.delete).toHaveBeenCalledWith(subscription);
	});

	it('keeps the feed when the deletion is cancelled', async () => {
		const { feeds } = renderFeeds(Header as Component<never>, { feed: subscription }, (feeds) => {
			vi.spyOn(feeds, 'delete').mockResolvedValue(true);
		});

		await fireEvent.click(screen.getByRole('button', { name: en.feeds.delete_feed }));
		await fireEvent.click(screen.getByRole('button', { name: '' }));

		await vi.waitFor(() => expect(screen.queryByText(en.feeds.delete_feed_description)).toBeNull());
		expect(feeds.delete).not.toHaveBeenCalled();
	});

	it('switches the entry size', async () => {
		const { feeds } = renderFeeds(Header as Component<never>, { feed: null });

		await fireEvent.click(screen.getByRole('button', { name: en.feeds.view_card }));

		expect(feeds.view).toBe('card');
	});
});

describe('EntryEdit', () => {
	it('fills in the keywords of the edited feed and saves them as comma-separated lists', async () => {
		const subscription = feedSubscription({ whitelist: 'apple, pear,, plum', blacklist: 'ads' });
		const onClose = vi.fn();
		const success = vi.spyOn(UiNotifications.prototype, 'success');
		const { feeds } = renderFeeds(EntryEdit as Component<never>, { onClose }, (feeds) => {
			feeds.activeFeed = subscription;
			vi.spyOn(feeds, 'update').mockResolvedValue(true);
		});

		expect(screen.getByText('apple')).toBeInTheDocument();
		expect(screen.getByText('plum')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(feeds.update).toHaveBeenCalledWith(subscription, { title: 'My Feed', whitelist: 'apple,pear,plum', blacklist: 'ads' });
		expect(success).toHaveBeenCalledWith(en.feeds.feed_update_success);
	});

	it('stays open and reports an error when the update fails', async () => {
		const onClose = vi.fn();
		const error = vi.spyOn(UiNotifications.prototype, 'error');
		renderFeeds(EntryEdit as Component<never>, { onClose }, (feeds) => {
			feeds.activeFeed = feedSubscription();
			vi.spyOn(feeds, 'update').mockResolvedValue(false);
		});

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		await vi.waitFor(() => expect(error).toHaveBeenCalledWith(en.feeds.feed_update_error));
		expect(onClose).not.toHaveBeenCalled();
	});

	it('tests a new feed first and then subscribes to it', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const { feeds } = renderFeeds(EntryEdit as Component<never>, { onClose }, (feeds) => {
			vi.spyOn(feeds, 'testFeed').mockResolvedValue([{ id: 't1', title: 'Preview item', link: '', published_at: '' }]);
			vi.spyOn(feeds, 'create').mockResolvedValue(true);
		});

		await user.type(screen.getByPlaceholderText(en.feeds.title), 'News');
		await user.type(screen.getByPlaceholderText(en.feeds.url), 'https://news.test/rss');
		await user.click(screen.getByRole('button', { name: en.feeds.test_feed }));
		expect(await screen.findByText('Preview item')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: en.layout.save }));

		await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(feeds.create).toHaveBeenCalledWith({ title: 'News', url: 'https://news.test/rss', whitelist: '', blacklist: '' });
	});
});

describe('FeedBrowserModal', () => {
	const available: Feed = { id: 'f1', title: 'Feed One', url: 'https://www.one.test/rss', subscriber_count: 3 };
	const friends: FriendFeed = { id: 'f2', title: 'Friend Feed', url: 'https://two.test/rss', subscriber_count: 2, friend_names: ['Ada', 'Bob'] };

	function renderBrowser(page: Feed[], friendFeeds: FriendFeed[], setup: Setup = () => {}): Feeds {
		return renderFeeds(FeedBrowserModal as Component<never>, {}, (feeds, feedImport) => {
			feeds.browseOpen = true;
			vi.spyOn(feeds, 'loadAvailableFeeds').mockResolvedValue(page);
			vi.spyOn(feeds, 'loadFriendFeeds').mockResolvedValue(friendFeeds);
			setup(feeds, feedImport);
		}).feeds;
	}

	it('lists the feeds of friends and all feeds with host and subscriber count', async () => {
		renderBrowser([available], [friends]);

		expect(await screen.findByText('Feed One')).toBeInTheDocument();
		expect(screen.getByText(en.feeds.browse_feeds_friends)).toBeInTheDocument();
		expect(screen.getByText(en.feeds.all_feeds)).toBeInTheDocument();
		expect(screen.getByText('one.test')).toBeInTheDocument();
		expect(screen.getByText('two.test')).toBeInTheDocument();
		expect(screen.getByText('Ada, Bob')).toBeInTheDocument();
		expect(screen.getByText(`3 ${en.feeds.browse_feeds_subscribers}`)).toBeInTheDocument();
		expect(screen.getByText(`2 ${en.feeds.browse_feeds_subscribers}`)).toBeInTheDocument();
	});

	it('shows the host as given when the url cannot be parsed', async () => {
		renderBrowser([{ ...available, url: 'not a url' }], []);

		expect(await screen.findByText('not a url')).toBeInTheDocument();
	});

	it('subscribes to a chosen feed and closes', async () => {
		const feeds = renderBrowser([available], [], (feeds) => {
			vi.spyOn(feeds, 'subscribe').mockResolvedValue({ ok: true, duplicate: false });
		});

		await screen.findByText('Feed One');
		await fireEvent.click(buttonWithText('Feed One'));

		await vi.waitFor(() => expect(feeds.browseOpen).toBe(false));
		expect(feeds.subscribe).toHaveBeenCalledWith({ title: 'Feed One', url: 'https://www.one.test/rss' });
	});

	it('says nothing was found only for a search without results', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderBrowser([], [], (feeds) => {
			vi.spyOn(feeds, 'searchFeeds').mockResolvedValue([]);
		});
		await vi.advanceTimersByTimeAsync(0);
		expect(screen.queryByText(en.feeds.browse_feeds_empty)).toBeNull();

		await user.type(screen.getByPlaceholderText(en.feeds.browse_feeds_search), 'zz');
		await vi.advanceTimersByTimeAsync(300);

		expect(screen.getByText(en.feeds.browse_feeds_empty)).toBeInTheDocument();
	});
});
