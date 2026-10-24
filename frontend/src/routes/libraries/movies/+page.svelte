<script lang="ts">
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import GenreModal from '$lib/components/libraries/shared/GenreModal.svelte';
	import MovieCreate from '$lib/components/libraries/movies/MovieCreate.svelte';
	import MovieDetail from '$lib/components/libraries/movies/MovieDetail.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import { getMovieLibrary } from '$lib/state/MovieLibrary.svelte';

	const library = getMovieLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<MovieCreate />
	{/if}
	{#if library.detailModalVisible}
		<MovieDetail />
	{/if}
	{#if library.genreModalVisible}
		<GenreModal {library} />
	{/if}
	<Entries {library} />
</div>
