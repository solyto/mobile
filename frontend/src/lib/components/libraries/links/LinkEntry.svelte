<script lang="ts">
	import type { Link } from '$lib/types/library_link';
	import { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import StarButton from '$lib/components/ui/buttons/StarButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';

	let { entry, library } = $props<{
		entry: Link;
		library: LinkLibrary;
	}>();

	const loadingIndicator = getLoadingIndicator();

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
	class="flex h-full w-full min-w-0 items-center"
	draggable="true"
	ondragstart={() => {
		library.draggedEntry = entry;
	}}
	ondragend={() => {
		library.draggedEntry = null;
		library.dragTarget = null;
	}}
>
	<div
		class="ml-1 h-9/10 w-1 flex-shrink-0 rounded-full"
		style="background-color: {entry.category?.color ?? '#1dbda5'};"
	></div>
	<img
		src={grabFaviconFromUrl(entry.url)}
		alt="Favicon"
		class="mx-1 ml-3 h-6 w-6 max-md:hidden"
	/>
	<div class="ml-4 max-w-8/12 min-w-0 text-left">
		<div class="truncate font-bold">{entry.title}</div>
		<div class="truncate text-sm">{entry.url}</div>
	</div>
	<div class="mr-1 h-full ml-auto flex flex-row items-center gap-4 self-start">
		<div
			class="relative flex items-center bg-c-neutral px-2 py-1 text-sm max-md:hidden dark:bg-s-dark-2"
		>
			{entry.category?.title ?? 'Uncategorized'}
		</div>
		{#if library.view === 'list'}
			<div class="max-md:hidden">
				<TagFlexList tags={entry.tags} />
			</div>
		{/if}
		<div class="text-sm max-md:hidden">
			{formatDate(entry.created_at)}
		</div>
		<div class="flex gap-1">
			<StarButton onClick={(e: MouseEvent) => onStar(e)} selected={entry.is_favorite} />
			<InlineDeleteButton onClick={(e: MouseEvent) => onDelete(e)} />
		</div>
	</div>
</a>
