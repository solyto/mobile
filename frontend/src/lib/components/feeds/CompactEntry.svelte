<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item, source }: {
		item: FeedItem;
		source: string;
	} = $props();

	let faviconUrl = grabFaviconFromUrl(item.link);
</script>

<a
	href={item.link}
	class="flex w-full gap-x-3 gap-y-1 rounded-sm border-c-neutral-1 px-2 py-2.5 transition-colors hover:bg-c-neutral max-md:flex-col md:items-center dark:border-s-dark dark:hover:bg-s-dark-3"
	target="_blank"
	rel="external"
	in:fade
>
	<img src={faviconUrl} alt="" class="h-5 w-5 shrink-0 max-md:hidden" />
	<span class="min-w-0 flex-1 text-[15px] leading-snug md:truncate">{item.title}</span>
	<span class="flex shrink-0 items-center gap-1.5 text-xs text-c-neutral-5 max-md:w-full md:gap-3 md:text-sm dark:text-c-neutral-4">
		<img src={faviconUrl} alt="" class="h-4 w-4 md:hidden" />
		<span class="max-w-48 truncate md:w-40">{source}</span>
		<span class="md:hidden">·</span>
		<span class="tabular-nums md:min-w-[15ch] md:text-right">{formatDateTime(new Date(item.published_at))}</span>
		<span class="ml-auto"><SaveToLibraryButton {item} /></span>
	</span>
</a>
