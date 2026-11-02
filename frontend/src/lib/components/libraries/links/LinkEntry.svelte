<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Link } from '$lib/types/library_link';
	import { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import StarButton from '$lib/components/ui/buttons/StarButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	let { entry, library, showCategory }: {
		entry: Link;
		library: LinkLibrary;
		showCategory: boolean;
	} = $props();

	const loadingIndicator = getLoadingIndicator();

	const ON_ROW_HOVER = 'md:group-hover/row:opacity-100 md:group-focus-within/row:opacity-100';

	async function onStar(e: MouseEvent) {
		e.preventDefault();
		loadingIndicator.start();
		await library.update(entry, { is_favorite: !entry.is_favorite });
		loadingIndicator.stop();
	}

	async function onDelete(e: MouseEvent) {
		e.preventDefault();
		loadingIndicator.start();
		await library.delete(entry);
		loadingIndicator.stop();
	}
</script>

<a
	href={entry.url}
	target="_blank"
	class="group/row isolate flex w-full min-w-0 items-center gap-3 rounded-sm border-c-neutral-1 px-2 py-2 transition-colors hover:bg-c-neutral dark:border-s-dark dark:hover:bg-s-dark-3"
	draggable="true"
	ondragstart={() => {
		library.draggedEntry = entry;
	}}
	ondragend={() => {
		library.draggedEntry = null;
		library.dragTarget = null;
	}}
	in:fade
>
	<img src={grabFaviconFromUrl(entry.url)} alt="" class="h-5 w-5 shrink-0" />
	<div class="min-w-0 flex-1 text-left">
		<div class="truncate">{entry.title}</div>
		<div class="truncate text-sm text-c-neutral-5 dark:text-c-neutral-4">{entry.url}</div>
	</div>
	<div class="max-md:hidden">
		<TagFlexList tags={entry.tags} />
	</div>
	{#if showCategory}
		<span class="flex w-32 shrink-0 items-center gap-1.5 text-sm text-c-neutral-5 max-md:hidden dark:text-c-neutral-4">
			{#if entry.category}
				<span class="size-2 shrink-0 rounded-full" style="background-color: {entry.category.color ?? 'var(--color-s-teal)'};"></span>
				<span class="truncate">{entry.category.title}</span>
			{/if}
		</span>
	{/if}
	<div class="flex shrink-0 items-center gap-1">
		<div class={ON_ROW_HOVER} class:md:opacity-0={!entry.is_favorite}>
			<StarButton onClick={(e: MouseEvent) => onStar(e)} selected={entry.is_favorite} />
		</div>
		<div class="md:opacity-0 {ON_ROW_HOVER}">
			<DeleteButton onClick={(e: MouseEvent) => onDelete(e)} inModal={false} buttonStyle="fill-on-hover" />
		</div>
	</div>
	<span class="shrink-0 text-sm text-c-neutral-5 tabular-nums max-md:hidden dark:text-c-neutral-4">{formatDate(entry.created_at)}</span>
</a>
