<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item }: {
		item: FeedItem;
	} = $props();

	let faviconUrl = $derived(grabFaviconFromUrl(item.link));
	let formattedDate = $derived(formatDateTime(new Date(item.published_at)));
</script>

<a href={item.link} class="w-full" target="_blank" rel="external" in:fade>
	<div
		class="flex w-full flex-row gap-2 rounded-sm bg-c-bg-surface p-2 drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral hover:drop-shadow-xl dark:hover:bg-s-dark-3"
	>
		<div class="flex w-full max-md:flex-col max-md:items-start md:flex-row md:items-center">
			<img src={faviconUrl} alt="Favicon" class="mx-1 h-6 w-6 max-md:hidden" />
			<div class="md:ml-2">
				<div>{item.title}</div>
			</div>
			<div
				class="mr-1 ml-auto flex flex-row items-center gap-1 text-sm text-c-neutral-5 max-md:mt-1 max-md:w-full max-md:justify-between max-md:text-xs md:flex-row-reverse dark:text-c-neutral-4"
			>
				<div class="flex items-center gap-1.5">
					<img src={faviconUrl} alt="Favicon" class="h-4 w-4 md:hidden" />
					<div class="tabular-nums md:min-w-[15ch] md:text-right">{formattedDate}</div>
				</div>
				<SaveToLibraryButton {item} />
			</div>
		</div>
	</div>
</a>
