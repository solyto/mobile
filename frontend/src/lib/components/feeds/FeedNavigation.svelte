<script lang="ts">
	import type { Component } from 'svelte';
	import { fade } from 'svelte/transition';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import IconSearch from '$lib/icons/lucide/search.svelte';
	import IconFileUp from '$lib/icons/lucide/file-up.svelte';
	import IconLoaderCircle from '$lib/icons/lucide/loader-circle.svelte';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { getFeedImport } from '$lib/state/FeedImport.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { FeedSubscription } from '$lib/types/feed';
	import Divider from '$lib/components/ui/Divider.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';

	const ts = getTranslation();
	const feeds = getFeeds();
	const feedImport = getFeedImport();

	let navigation = $state<HTMLDivElement | null>(null);

	function toggleMobile(): void {
		if (navigation) {
			navigation.style.display = 'block';
		}
	}

	function handleNavigation(): void {
		if (navigation && navigation.style.display === 'block') {
			navigation.style.display = 'none';
		}
	}

	function isActive(feed: FeedSubscription | null): boolean {
		return feeds.activeFeed?.id === feed?.id;
	}

	function select(feed: FeedSubscription | null): void {
		feeds.selectFeed(feed);
		handleNavigation();
	}

	function openAddFeed(): void {
		feeds.modalOpen = true;
		handleNavigation();
	}

	function openBrowse(): void {
		feeds.browseOpen = true;
		handleNavigation();
	}

	function openImport(): void {
		feedImport.modalOpen = true;
		handleNavigation();
	}
</script>

{#snippet action(Icon: Component<{ size?: number; class?: string }>, title: string, onclick: () => void, busy: boolean = false)}
	<button
		class="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
		{onclick}
	>
		<Icon size={16} class="shrink-0 text-c-neutral-5 dark:text-c-neutral-4" />
		{title}
		{#if busy}
			<IconLoaderCircle size={14} class="ml-auto shrink-0 animate-spin text-c-neutral-5 dark:text-c-neutral-4" />
			<span class="sr-only">{ts.get.feeds.import_in_progress}</span>
		{/if}
	</button>
{/snippet}

<HamburgerButton onclick={toggleMobile} top={3} />
<div
	class="secondary-nav-mobile-container absolute z-50 hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg max-md:pb-20 drop-shadow-xl lg:relative lg:flex lg:w-32 lg:p-2 2xl:w-60 2xl:p-4 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
	bind:this={navigation}
>
	<div class="flex items-center justify-between border-b border-c-neutral-2 p-4 mb-4 lg:hidden dark:border-s-dark-3">
		<span class="text-2xl font-bold 2xl:font-normal">{ts.get.feeds.feeds}</span>
		<CloseButton onClick={handleNavigation} inModal={false} />
	</div>

	<div class="p-4 lg:p-0">
		<button type="button" class="w-full cursor-pointer text-left" onclick={() => select(null)}>
			<div
				class="rounded-lg p-2 hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={isActive(null)}
				class:dark:bg-s-dark-3={isActive(null)}
			>
				{ts.get.feeds.all_feeds}
			</div>
		</button>
		<div class="mt-2 p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
			{ts.get.feeds.feeds}
		</div>
		{#each feeds.feeds as feed (feed.id)}
			<button type="button" class="w-full cursor-pointer text-left" onclick={() => select(feed)}>
				<div
					class="relative mr-1 max-md:mr-4 rounded-lg p-2 hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={isActive(feed)}
					class:dark:bg-s-dark-3={isActive(feed)}
				>
					<Badge
						i={feeds.getFeedCount(feed)}
						color="var(--color-c-neutral-1)"
						top="7px"
						light={true}
					/>
					<div class="truncate pr-6">{feed.title}</div>
				</div>
			</button>
		{/each}
		<Divider />
		<div class="flex flex-col gap-1 text-sm">
			{@render action(IconPlus, ts.get.feeds.add_feed, openAddFeed)}
			{@render action(IconSearch, ts.get.feeds.browse_feeds, openBrowse)}
			{@render action(IconFileUp, ts.get.feeds.import_opml, openImport, feedImport.polling)}
		</div>
	</div>
</div>
