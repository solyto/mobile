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
	import type { Library } from '$lib/types/library';
	import Releases from '$lib/components/libraries/shared/Releases.svelte';

	let { library } = $props<{ library: Library }>();

	const ts = getTranslation();
</script>

<div class="relative mb-4 w-full text-right">
	{#if library.config.hasViewSwitcher}
		<ViewSwitcher {library} />
	{/if}
	<div class="ml-auto flex items-center justify-end gap-2">
		{#if library.config.hasFilters}
			<Filter {library} />
		{/if}
		<Search {library} />
		{#if library.config.hasReleases}
			<Releases {library} />
		{/if}
		{#if library.config.hasRecommender}
			<Recommender {library} />
		{/if}
		{#if library.config.hasGenres}
			<TextButton title={ts.get.libraries.edit_genres} onclick={() => library.openGenreModal()} type="slight" class="max-md:hidden" />
			<IconButton type="slight" onclick={() => library.openGenreModal()} class="md:hidden">
				<IconTag />
			</IconButton>
		{/if}
		<TextButton title={ts.get.libraries.create} onclick={() => library.openCreateModal()} class="max-md:hidden" />
		<IconButton onclick={() => library.openCreateModal()} class="md:hidden">
			<IconPlus />
		</IconButton>
	</div>
	<div class="text-surface-300 mx-2 my-4 text-xs">{library.entries.length} entries</div>
</div>
