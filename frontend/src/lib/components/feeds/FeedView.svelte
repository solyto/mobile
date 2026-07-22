<script lang="ts">
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import CompactEntry from '$lib/components/feeds/CompactEntry.svelte';
	import ComfortableEntry from '$lib/components/feeds/ComfortableEntry.svelte';
	import CardEntry from '$lib/components/feeds/CardEntry.svelte';

	const feeds = getFeeds();

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

{#if feeds.view === 'compact'}
	<div class="flex w-full flex-col gap-2">
		{#each feeds.filteredItems as item (item.id)}
			<CompactEntry {item} />
		{/each}
	</div>
{:else if feeds.view === 'comfortable'}
	<div class="flex w-full flex-col gap-2">
		{#each feeds.filteredItems as item (item.id)}
			<ComfortableEntry {item} />
		{/each}
	</div>
{:else}
	<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each feeds.filteredItems as item (item.id)}
			<CardEntry {item} />
		{/each}
	</div>
{/if}

<div bind:this={sentinel} class="h-px"></div>
