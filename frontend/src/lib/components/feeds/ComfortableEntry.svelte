<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import { stripHtml, hasMeaningfulDescription } from '$lib/helpers/FormatHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item }: {
		item: FeedItem;
	} = $props();

	let faviconUrl = $derived(grabFaviconFromUrl(item.link));
	let formattedDate = $derived(formatDateTime(new Date(item.published_at)));
</script>

<a href={item.link} class="w-full" target="_blank" rel="external" in:fade>
	<div
		class="flex w-full flex-col rounded-sm bg-c-bg-surface p-3 drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral hover:drop-shadow-xl dark:hover:bg-s-dark-3"
	>
		<div class="flex min-w-0 items-center gap-2">
			<img src={faviconUrl} alt="Favicon" class="h-5 w-5 flex-shrink-0 max-md:hidden" />
			<span class="flex-1 font-bold max-md:line-clamp-2 md:truncate">{item.title}</span>
			<div class="flex flex-shrink-0 items-center gap-1 max-md:hidden">
				<SaveToLibraryButton {item} />
				<span class="min-w-[15ch] text-right text-sm tabular-nums text-c-neutral-5 dark:text-c-neutral-4">{formattedDate}</span>
			</div>
		</div>
		{#if hasMeaningfulDescription(item.description)}
			<p class="mt-2 line-clamp-2 text-sm text-c-neutral-6 dark:text-c-neutral-4">
				{stripHtml(item.description)}
			</p>
		{/if}
		<div class="mt-2 flex items-center justify-between md:hidden">
			<div class="flex items-center gap-1.5">
				<img src={faviconUrl} alt="Favicon" class="h-4 w-4" />
				<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">{formattedDate}</span>
			</div>
			<SaveToLibraryButton {item} />
		</div>
	</div>
</a>
