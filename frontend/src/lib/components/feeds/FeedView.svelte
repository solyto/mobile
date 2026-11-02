<script lang="ts">
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import CompactEntry from '$lib/components/feeds/CompactEntry.svelte';
	import ComfortableEntry from '$lib/components/feeds/ComfortableEntry.svelte';
	import CardEntry from '$lib/components/feeds/CardEntry.svelte';

	const feeds = getFeeds();
	const ts = getTranslation();

	const DIVIDED_LIST = 'flex w-full flex-col divide-y';

	let sentinel: HTMLDivElement;

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) feeds.loadMore();
			},
			{ rootMargin: '1000px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

{#if feeds.loaded && !feeds.loadingMore && feeds.filteredItems.length === 0}
	{#if feeds.feeds.length === 0}
		<EmptyState title={ts.get.feeds.no_feeds} description={ts.get.feeds.no_feeds_desc} py={6} />
	{:else}
		<EmptyState title={ts.get.feeds.no_items} description={ts.get.feeds.no_items_desc} py={6} />
	{/if}
{:else if feeds.view === 'compact'}
	<div class={DIVIDED_LIST}>
		{#each feeds.filteredItems as item (item.id)}
			<CompactEntry {item} source={feeds.getFeedTitle(item.feed_id)} />
		{/each}
	</div>
{:else if feeds.view === 'comfortable'}
	<div class={DIVIDED_LIST}>
		{#each feeds.filteredItems as item (item.id)}
			<ComfortableEntry {item} source={feeds.getFeedTitle(item.feed_id)} />
		{/each}
	</div>
{:else}
	<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(min(22rem,100%),1fr))] gap-x-4 gap-y-8">
		{#each feeds.filteredItems as item (item.id)}
			<CardEntry {item} source={feeds.getFeedTitle(item.feed_id)} />
		{/each}
	</div>
{/if}

<div bind:this={sentinel} class="h-px"></div>
