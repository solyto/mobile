<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item } = $props<{
		item: FeedItem;
	}>();

	function stripHtml(html: string): string {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent ?? '';
	}

	let faviconUrl = $derived(grabFaviconFromUrl(item.link));
	let formattedDate = $derived(formatDateTime(new Date(item.published_at)));
</script>

<a href={item.link} class="w-full" target="_blank" rel="external" in:fade>
	<div
		class="flex w-full flex-col rounded-sm bg-c-bg-surface p-3 drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral hover:drop-shadow-xl dark:hover:bg-s-dark-3"
	>
		<div class="mb-1 flex min-w-0 items-start gap-2">
			<img src={faviconUrl} alt="Favicon" class="h-5 w-5 flex-shrink-0" />
			<span class="flex-1 truncate font-bold">{item.title}</span>
			<div class="flex flex-shrink-0 items-center gap-2">
				<SaveToLibraryButton {item} />
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{formattedDate}</span>
			</div>
		</div>
		{#if item.description}
			<p class="mt-1 line-clamp-2 text-sm text-c-neutral-6 dark:text-c-neutral-4">
				{stripHtml(item.description)}
			</p>
		{/if}
	</div>
</a>
