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
	let imageFailed = $state(false);

	function hasImage(): boolean {
		return !!item.image_url && !imageFailed;
	}
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class="grid w-full grid-cols-[1fr_auto] gap-y-2 rounded-sm border-c-neutral-1 px-2 py-3 transition-colors md:gap-x-4 hover:bg-c-neutral dark:border-s-dark dark:hover:bg-s-dark-3"
	class:gap-x-4={hasImage()}
	target="_blank"
	rel="external"
	in:fade
>
	<div class="flex min-w-0 flex-col gap-1">
		<span class="line-clamp-2 leading-snug font-semibold">{item.title}</span>
		{#if hasMeaningfulDescription(item.description)}
			<p class="line-clamp-2 text-sm text-c-neutral-6 dark:text-c-neutral-4">{stripHtml(item.description)}</p>
		{/if}
	</div>
	<div
		class="flex size-20 items-center justify-center overflow-hidden rounded-sm bg-c-neutral-1 md:row-span-2 md:h-24 md:w-36 dark:bg-s-dark-3"
		class:max-md:hidden={!hasImage()}
	>
		{#if hasImage()}
			<img
				src={item.image_url}
				alt=""
				loading="lazy"
				decoding="async"
				onerror={() => (imageFailed = true)}
				class="h-full w-full object-cover"
			/>
		{:else}
			<img src={faviconUrl} alt="" class="h-6 w-6 opacity-60" />
		{/if}
	</div>
	<EntryMeta {item} {source} {faviconUrl} class="col-span-2 self-end md:col-span-1 md:col-start-1 md:text-sm" />
</svelte:element>
