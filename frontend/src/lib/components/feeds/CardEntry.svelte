<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import { stripHtml, hasMeaningfulDescription } from '$lib/helpers/FormatHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item, source }: {
		item: FeedItem;
		source: string;
	} = $props();

	let faviconUrl = grabFaviconFromUrl(item.link);
	let imageLoaded = $state(false);
	let imageFailed = $state(false);
</script>

<a href={item.link} class="group w-full" target="_blank" rel="external" in:fade>
	<div class="flex h-full w-full flex-col">
		<div
			class="relative aspect-video w-full overflow-hidden rounded-sm bg-c-neutral-1 drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 group-hover:drop-shadow-xl dark:bg-s-dark-3"
		>
			{#if item.image_url && !imageFailed}
				{#if !imageLoaded}
					<div class="absolute inset-0 animate-pulse"></div>
				{/if}
				<img
					src={item.image_url}
					alt=""
					loading="lazy"
					decoding="async"
					onload={() => (imageLoaded = true)}
					onerror={() => (imageFailed = true)}
					class="h-full w-full object-cover transition-opacity duration-300"
					class:opacity-0={!imageLoaded}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<img src={faviconUrl} alt="" class="h-10 w-10 opacity-60" />
				</div>
			{/if}
		</div>
		<div class="flex flex-1 flex-col gap-1 pt-3">
			<span class="line-clamp-3 leading-snug font-semibold">{item.title}</span>
			{#if hasMeaningfulDescription(item.description)}
				<p class="line-clamp-3 text-sm text-c-neutral-6 dark:text-c-neutral-4">{stripHtml(item.description)}</p>
			{/if}
			<span class="mt-auto flex min-w-0 items-center gap-1.5 pt-2 text-xs text-c-neutral-5 dark:text-c-neutral-4">
				<img src={faviconUrl} alt="" class="h-4 w-4" />
				<span class="truncate">{source}</span>
				<span>·</span>
				<span class="whitespace-nowrap tabular-nums">{formatDateTime(new Date(item.published_at))}</span>
				<span class="ml-auto"><SaveToLibraryButton {item} /></span>
			</span>
		</div>
	</div>
</a>
