<script lang="ts">
	import type { Snippet } from 'svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import IconTag from '$lib/icons/lucide/tag.svelte';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/libraries/shared/ViewSwitcher.svelte';
	import Search from '$lib/components/libraries/shared/Search.svelte';
	import Recommender from '$lib/components/libraries/shared/Recommender.svelte';
	import Filter from '$lib/components/libraries/filters/Filter.svelte';
	import type { FilterLibrary, GenreLibrary, Library, ViewLibrary } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import Releases from '$lib/components/libraries/shared/Releases.svelte';

	let { library, children }: {
		library: Library;
		children?: Snippet;
	} = $props();

	const ts = getTranslation();

	function openGenreModal(): void {
		(library as GenreLibrary).openGenreModal();
	}

	function openCreateModal(): void {
		library.openCreateModal();
	}

	function entriesCount(): string {
		return ts.get.libraries.entries_count.replace('%s', library.entries.length.toString());
	}
</script>

<div class="relative mb-4 w-full">
	{#if library.config.hasViewSwitcher}
		<ViewSwitcher library={library as ViewLibrary} />
	{/if}
	<div class="grid grid-cols-[1fr_auto] items-center gap-x-4">
		{#if children}
			<div class="row-span-2 min-w-0">{@render children()}</div>
		{/if}
		<div class="col-start-2 flex items-center justify-end gap-2">
			{#if library.config.hasFilters}
				<Filter library={library as FilterLibrary} />
			{/if}
			<Search {library} />
			{#if library.config.hasReleases}
				<Releases library={library as MusicLibrary | BookLibrary | MovieLibrary} />
			{/if}
			{#if library.config.hasRecommender}
				<Recommender library={library as MusicLibrary | BookLibrary} />
			{/if}
			{#if library.config.hasGenres}
				<TextButton title={ts.get.libraries.edit_genres} onclick={openGenreModal} type="slight" class="max-md:hidden" />
				<IconButton type="slight" onclick={openGenreModal} class="max-md:px-2 md:hidden">
					<IconTag />
				</IconButton>
			{/if}
			<TextButton title={ts.get.libraries.create} onclick={openCreateModal} class="max-md:hidden" />
			<IconButton onclick={openCreateModal} class="max-md:px-2 md:hidden">
				<IconPlus />
			</IconButton>
		</div>
		<div class="text-surface-300 col-start-2 mx-2 my-4 text-right text-xs">{entriesCount()}</div>
	</div>
</div>
