<script lang="ts">
	import type { FeedItem } from '$lib/types/feed';
	import { formatDateTime } from '$lib/helpers/DateHelper';
	import SaveToLibraryButton from '$lib/components/feeds/SaveToLibraryButton.svelte';

	let { item, source, faviconUrl, class: className }: {
		item: FeedItem;
		source: string;
		faviconUrl: string;
		class: string;
	} = $props();
</script>

<span class="flex min-w-0 items-center gap-1.5 text-xs text-c-neutral-5 dark:text-c-neutral-4 {className}">
	<img src={faviconUrl} alt="" class="h-4 w-4" />
	<span class="truncate">{source}</span>
	<span>·</span>
	<span class="whitespace-nowrap tabular-nums">{formatDateTime(new Date(item.published_at))}</span>
	<span class="ml-auto"><SaveToLibraryButton {item} /></span>
</span>
