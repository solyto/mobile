<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import { stripHtml, hasMeaningfulDescription } from '$lib/helpers/HtmlHelper';
	import EntryMeta from '$lib/components/feeds/EntryMeta.svelte';
	import { safeHref } from '$lib/helpers/UrlHelper';

	let { item, source }: {
		item: FeedItem;
		source: string;
	} = $props();

	let faviconUrl = grabFaviconFromUrl(item.link);
	let href = safeHref(item.link);
	let imageLoaded = $state(false);
	let imageFailed = $state(false);
</script>

<svelte:element this={href ? 'a' : 'div'} {href} class="group w-full" target="_blank" rel="external" in:fade>
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
			<EntryMeta {item} {source} {faviconUrl} class="mt-auto pt-2" />
		</div>
	</div>
</svelte:element>
