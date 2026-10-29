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
	let imageLoaded = $state(false);
	let imageFailed = $state(false);
</script>

<a href={item.link} class="w-full" target="_blank" rel="external" in:fade>
	<div
		class="flex h-full w-full flex-col overflow-hidden rounded-sm bg-c-bg-surface drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral hover:drop-shadow-xl dark:hover:bg-s-dark-3"
	>
		<div class="relative w-full overflow-hidden md:h-40">
			{#if item.image_url && !imageFailed}
				{#if !imageLoaded}
					<div class="absolute inset-0 animate-pulse bg-c-neutral-1 dark:bg-s-dark-3"></div>
				{/if}
				<img
					src={item.image_url}
					alt=""
					loading="lazy"
					decoding="async"
					onload={() => (imageLoaded = true)}
					onerror={() => (imageFailed = true)}
					class="h-40 w-full object-cover transition-opacity duration-300 {imageLoaded ? 'opacity-100' : 'opacity-0'}"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-c-neutral-1 max-md:hidden dark:bg-s-dark-3">
					<img src={faviconUrl} alt="" class="h-10 w-10 opacity-60" />
				</div>
			{/if}
		</div>
		<div class="flex flex-1 flex-col p-4">
			<span class="mb-2 line-clamp-2 text-lg leading-tight font-bold">{item.title}</span>
			{#if hasMeaningfulDescription(item.description)}
				<p class="line-clamp-4 text-sm text-c-neutral-6 dark:text-c-neutral-4">
					{stripHtml(item.description)}
				</p>
			{/if}
			<div class="mt-auto pt-3">
				<div class="flex items-center justify-between border-t border-c-neutral-1 pt-2 dark:border-s-dark">
					<div class="flex items-center gap-1.5">
						<img src={faviconUrl} alt="Favicon" class="h-4 w-4" />
						<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">{formattedDate}</span>
					</div>
					<SaveToLibraryButton {item} />
				</div>
			</div>
		</div>
	</div>
</a>
