<script lang="ts">
	import { onMount } from 'svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import type { Feed, FriendFeed } from '$lib/types/feed';

	const ts = getTranslation();
	const feeds = getFeeds();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let results = $state<Feed[]>([]);
	let friendFeeds = $state<FriendFeed[]>([]);
	let query = $state<string>('');
	let initialLoading = $state<boolean>(true);
	let loadingMore = $state<boolean>(false);
	let hasMore = $state<boolean>(true);
	let isSearching = $state<boolean>(false);
	let offset = $state<number>(0);
	let scrollContainer = $state<HTMLDivElement | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const PAGE_SIZE = 50;

	onMount(async () => {
		await Promise.all([loadPage(), loadFriends()]);
		initialLoading = false;
	});

	async function loadPage(): Promise<void> {
		const page = await feeds.loadAvailableFeeds(offset);
		results = [...results, ...page];
		hasMore = page.length === PAGE_SIZE;
		offset += page.length;
	}

	async function loadFriends(): Promise<void> {
		friendFeeds = await feeds.loadFriendFeeds();
	}

	async function loadMore(): Promise<void> {
		if (loadingMore || !hasMore || isSearching) return;
		loadingMore = true;
		await loadPage();
		loadingMore = false;
	}

	function onScroll(): void {
		if (!scrollContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		if (scrollHeight - scrollTop - clientHeight < 120) {
			loadMore();
		}
	}

	function onQueryInput(): void {
		if (debounceTimer) clearTimeout(debounceTimer);

		if (query.length < 2) {
			isSearching = false;
			return;
		}

		debounceTimer = setTimeout(async () => {
			isSearching = true;
			results = await feeds.searchFeeds(query);
			hasMore = false;
		}, 300);
	}

	$effect(() => {
		if (query.length < 2 && isSearching) {
			isSearching = false;
			results = [];
			offset = 0;
			hasMore = true;
			initialLoading = true;
			loadPage().then(() => (initialLoading = false));
		}
	});

	async function subscribe(feed: Feed | FriendFeed): Promise<void> {
		loadingIndicator.start();
		const res = await feeds.subscribe({ title: feed.title, url: feed.url });
		if (res.ok) {
			notifications.success(ts.get.feeds.feed_add_success);
			feeds.browseOpen = false;
		} else if (res.duplicate) {
			notifications.error(ts.get.feeds.feed_already_subscribed);
		} else {
			notifications.error(ts.get.feeds.feed_add_error);
		}
		loadingIndicator.stop();
	}

	function hostname(url: string): string {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

<ContentModal title={ts.get.feeds.browse_feeds} onClose={() => { feeds.browseOpen = false; }} rounded="2xl" p="8" width="3xl">
	<div class="flex flex-col gap-6">
		<TextInput
			bind:value={query}
			oninput={onQueryInput}
			placeholder={ts.get.feeds.browse_feeds_search}
		/>

		<div
			bind:this={scrollContainer}
			onscroll={onScroll}
			class="flex flex-col gap-6 overflow-y-auto"
			style="max-height: 60vh;"
		>
			{#if initialLoading}
				<div class="flex items-center justify-center py-16">
					<span class="text-sm text-c-neutral-4">...</span>
				</div>
			{:else}
				{#if !isSearching && friendFeeds.length > 0}
					<div class="flex flex-col gap-3">
						<h3 class="text-sm font-semibold text-c-heading dark:text-c-primary">
							{ts.get.feeds.browse_feeds_friends}
						</h3>
						<div class="grid grid-cols-2 gap-3">
							{#each friendFeeds as feed (feed.id)}
								<button
									type="button"
									onclick={() => subscribe(feed)}
									class="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-c-neutral-1 p-4 text-left
										transition-all hover:border-c-primary hover:shadow-sm
										dark:border-s-dark dark:hover:border-c-primary"
								>
									<div class="flex items-center gap-2">
										<img src={grabFaviconFromUrl(feed.url)} alt="" class="h-4 w-4 shrink-0 rounded" />
										<span class="line-clamp-2 text-sm font-semibold leading-snug dark:text-white">
											{feed.title}
										</span>
									</div>
									<span class="text-xs text-c-neutral-4">{hostname(feed.url)}</span>
									<div class="mt-0.5 flex items-center gap-2 text-xs text-c-neutral-4">
										<span class="text-c-primary">{feed.friend_names.join(', ')}</span>
										{#if feed.subscriber_count > 1}
											<span>·</span>
											<span>{feed.subscriber_count} {ts.get.feeds.browse_feeds_subscribers}</span>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if results.length === 0 && !isSearching}
					<!-- no-op: only shown when explicitly searching with no results -->
				{:else if results.length === 0}
					<div class="flex items-center justify-center py-16">
						<span class="text-sm text-c-neutral-4">{ts.get.feeds.browse_feeds_empty}</span>
					</div>
				{:else}
					<div class="flex flex-col gap-3">
						{#if !isSearching}
							<h3 class="text-sm font-semibold text-c-heading dark:text-c-primary">
								{ts.get.feeds.all_feeds}
							</h3>
						{/if}
						<div class="grid grid-cols-2 gap-3">
							{#each results as feed (feed.id)}
								<button
									type="button"
									onclick={() => subscribe(feed)}
									class="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-c-neutral-1 p-4 text-left
										transition-all hover:border-c-primary hover:shadow-sm
										dark:border-s-dark dark:hover:border-c-primary"
								>
									<div class="flex items-center gap-2">
										<img src={grabFaviconFromUrl(feed.url)} alt="" class="h-4 w-4 shrink-0 rounded" />
										<span class="line-clamp-2 text-sm font-semibold leading-snug dark:text-white">
											{feed.title}
										</span>
									</div>
									<span class="text-xs text-c-neutral-4">{hostname(feed.url)}</span>
									{#if feed.subscriber_count && feed.subscriber_count > 0}
										<span class="text-xs text-c-neutral-4">
											{feed.subscriber_count} {ts.get.feeds.browse_feeds_subscribers}
										</span>
									{/if}
								</button>
							{/each}
						</div>
						{#if loadingMore}
							<div class="py-4 text-center text-sm text-c-neutral-4">...</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</ContentModal>
