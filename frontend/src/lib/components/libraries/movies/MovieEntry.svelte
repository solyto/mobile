<script lang="ts">
	import type { Movie } from '$lib/types/library_movie';
	import { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import Flag from '$lib/components/ui/Flag.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { entry, library } = $props<{
		entry: Movie;
		library: MovieLibrary;
	}>();
</script>

{#if entry.wishlist}
	<Flag title={ts.get.libraries.wishlist} />
{/if}
<div class="text-left">
	<div class="font-bold">{entry.title}</div>
	<div class="text-sm">{entry.author}</div>
</div>
{#if library.view === 'list'}
	<div class="ml-auto flex flex-row items-center gap-4">
		<TagFlexList tags={entry.tags} />
		<GenreFlexList genres={entry.genres} />
		{#if entry.rating}
			<Rating startRating={entry.rating} />
		{/if}
	</div>
{/if}
