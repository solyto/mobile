<script lang="ts">
	import IconBookmarkPlus from '@lucide/svelte/icons/bookmark-plus';
	import IconBookmarkCheck from '@lucide/svelte/icons/bookmark-check';
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import type { FeedItem } from '$lib/types/feed';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { scale, blur } from 'svelte/transition';
	import type { CreateLinkRequest } from '$lib/types/library_link';

	let { item } = $props<{
		item: FeedItem;
	}>();

	const linkLibrary = getLinkLibrary();
	const feeds = getFeeds();

	async function saveToLibrary(e: Event): Promise<void> {
		e.preventDefault();

		if (feeds.isInLibrary(item.id)) {
			const res = await linkLibrary.deleteByLink(item.link);
			if (res) feeds.unsaveToLibrary(item);
		} else {
			const request: CreateLinkRequest = {
				title: item.title,
				url: item.link,
				category_id: null
			};
			const res = await linkLibrary.create(request);
			if (res) feeds.saveToLibrary(item);
		}
	}
</script>

<button class="cursor-pointer" onclick={(e) => saveToLibrary(e)}>
	{#if feeds.isInLibrary(item.id)}
		<div in:scale><IconBookmarkCheck class="p-1 text-c-primary" /></div>
	{:else}
		<div in:scale><IconBookmarkPlus class="p-1 text-c-btn-hover" /></div>
	{/if}
</button>
