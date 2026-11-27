<script lang="ts">
	import IconBookmarkPlus from '$lib/icons/lucide/bookmark-plus.svelte';
	import IconBookmarkCheck from '$lib/icons/lucide/bookmark-check.svelte';
	import type { FeedItem } from '$lib/types/feed';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { scale } from 'svelte/transition';

	let { item }: {
		item: FeedItem;
	} = $props();

	const feeds = getFeeds();

	async function toggleSaved(e: Event): Promise<void> {
		e.preventDefault();

		if (item.saved_link_id) await feeds.unsaveFromLibrary(item);
		else await feeds.saveToLibrary(item);
	}
</script>

<button class="cursor-pointer" onclick={toggleSaved}>
	{#if item.saved_link_id}
		<div in:scale><IconBookmarkCheck class="block p-1 text-c-primary" /></div>
	{:else}
		<div in:scale><IconBookmarkPlus class="block p-1 text-c-neutral-5 hover:text-c-btn-hover dark:text-c-neutral-4" /></div>
	{/if}
</button>
