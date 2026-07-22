<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item } = $props<{
		item: FeedItem;
	}>();

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
				<div class="font-bold">{item.title}</div>
			</div>
			<div
				class="mr-1 ml-auto flex flex-row items-center gap-2 text-sm text-c-neutral-5 max-md:mt-1 max-md:text-xs dark:text-c-neutral-4"
			>
				<SaveToLibraryButton {item} />
				<img src={faviconUrl} alt="Favicon" class="h-4 w-4 md:hidden" />
				<div>{formattedDate}</div>
			</div>
		</div>
	</div>
</a>
