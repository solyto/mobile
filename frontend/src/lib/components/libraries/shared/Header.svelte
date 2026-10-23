<script lang="ts">
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import IconTag from '@lucide/svelte/icons/tag';
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/libraries/shared/ViewSwitcher.svelte';
	import Search from '$lib/components/libraries/shared/Search.svelte';
	import Recommender from '$lib/components/libraries/shared/Recommender.svelte';
	import Filter from '$lib/components/libraries/filters/Filter.svelte';
	import type { FilterLibrary, GenreLibrary, Library } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import Releases from '$lib/components/libraries/shared/Releases.svelte';

	let { library }: { library: Library } = $props();

	const ts = getTranslation();
</script>

<div class="relative mb-4 w-full">
	{#if library.config.hasViewSwitcher}
		<ViewSwitcher {library} />
	{/if}
	<div class="ml-auto flex items-center justify-end gap-2">
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
			<TextButton title={ts.get.libraries.edit_genres} onclick={() => (library as GenreLibrary).openGenreModal()} type="slight" class="max-md:hidden" />
			<IconButton type="slight" onclick={() => (library as GenreLibrary).openGenreModal()} class="md:hidden">
				<IconTag />
			</IconButton>
		{/if}
		<TextButton title={ts.get.libraries.create} onclick={() => library.openCreateModal()} class="max-md:hidden" />
		<IconButton onclick={() => library.openCreateModal()} class="md:hidden">
			<IconPlus />
		</IconButton>
	</div>
	<div class="text-surface-300 mx-2 my-4 text-right text-xs">{library.entries.length} entries</div>
</div>
