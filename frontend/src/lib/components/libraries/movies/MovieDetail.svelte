<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import { getMovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import type { Movie } from '$lib/types/library_movie';

	const library = getMovieLibrary();
	const entry = library.activeEntry as Movie;

	const ts = getTranslation();
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	<div class="text-sm text-c-neutral-6">
		{#if entry.category === 'movie'}
			{ts.get.libraries.movies.category_movie}
		{:else}
			{ts.get.libraries.movies.category_series}
		{/if}
	</div>
	<div class="text-sm text-c-neutral-6">
		{entry.genres.map((g) => g.title).join(', ')}
	</div>
	<div class:hidden={entry.tags.length === 0} class="text-sm text-c-neutral-6">
		{entry.tags.map((t) => t.name).join(', ')}
	</div>
	<div class="text-sm" class:hidden={entry.publication_year === null}>
		{entry.publication_year}
	</div>
	<div class:hidden={entry.started_at === null}>
		{ts.get.libraries.movies.started_at}
		{entry.started_at ? formatDate(entry.started_at) : ''}
	</div>
	<div class:hidden={entry.finished_at === null}>
		{ts.get.libraries.movies.finished_at}
		{entry.finished_at ? formatDate(entry.finished_at) : ''}
	</div>

</DetailModal>
