<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';

	const feeds = getFeeds();

	let { item } = $props<{
		item: FeedItem;
	}>();

	function stripHtml(html: string): string {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent ?? '';
	}

	let size = $derived(feeds.view);
	let faviconUrl = $derived(grabFaviconFromUrl(item.link));
	let formattedDate = $derived(formatDateTime(new Date(item.published_at)));
</script>

<a href={item.link} class="w-full" target="_blank" rel="external" in:fade>
	<div
		class="flex w-full flex-col rounded-sm bg-c-bg-surface p-2 drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral hover:drop-shadow-xl dark:hover:bg-s-dark-3"
		class:p-3={size === 'comfortable'}
		class:p-4={size === 'card'}
		class:flex-row={size === 'compact'}
		class:gap-2={size === 'compact'}
		class:h-full={size === 'card'}
	>
		{#if size === 'compact'}
			<div class="flex w-full max-md:flex-col max-md:items-start md:flex-row md:items-center">
				<img src={faviconUrl} alt="Favicon" class="mx-1 h-6 w-6 max-md:hidden" />
				<div class="md:ml-2">
					<div class="font-bold">{item.title}</div>
				</div>
				<div
					class="mr-1 ml-auto flex flex-row items-center gap-2 text-sm text-c-neutral-5 max-md:mt-1 max-md:text-xs dark:text-c-neutral-4"
				>
					<img src={faviconUrl} alt="Favicon" class="h-4 w-4 md:hidden" />
					<div>{formattedDate}</div>
				</div>
			</div>
		{:else}
			<div
				class="flex items-start gap-2"
				class:mb-2={size === 'card'}
				class:mb-1={size === 'comfortable'}
			>
				<img
					src={faviconUrl}
					alt="Favicon"
					class:h-5={size === 'comfortable'}
					class:w-5={size === 'comfortable'}
					class:h-6={size === 'card'}
					class:w-6={size === 'card'}
				/>
				<span
					class="font-bold"
					class:text-lg={size === 'card'}
					class:leading-tight={size === 'card'}
					class:line-clamp-2={size === 'card'}>{item.title}</span
				>
				{#if size === 'comfortable'}
					<span class="ml-auto flex-shrink-0 text-sm text-c-neutral-5 dark:text-c-neutral-4"
						>{formattedDate}</span
					>
				{/if}
			</div>
			{#if item.description}
				<p
					class="text-sm text-c-neutral-6 dark:text-c-neutral-4"
					class:line-clamp-2={size === 'comfortable'}
					class:mt-1={size === 'comfortable'}
					class:line-clamp-4={size === 'card'}
					class:flex-1={size === 'card'}
				>
					{stripHtml(item.description)}
				</p>
			{/if}
			{#if size === 'card'}
				<div
					class="mt-3 border-t border-c-neutral-1 pt-2 text-xs text-c-neutral-5 dark:border-s-dark dark:text-c-neutral-4"
				>
					{formattedDate}
				</div>
			{/if}
		{/if}
	</div>
</a>
