<script lang="ts">
	import BookEntry from '$lib/components/libraries/books/BookEntry.svelte';
	import MusicEntry from '$lib/components/libraries/music/MusicEntry.svelte';
	import LinkEntry from '$lib/components/libraries/links/LinkEntry.svelte';
	import RecipeEntry from '$lib/components/libraries/recipes/RecipeEntry.svelte';
	import MovieEntry from '$lib/components/libraries/movies/MovieEntry.svelte';
	import GameEntry from '$lib/components/libraries/games/GameEntry.svelte';
	import PlantEntry from '$lib/components/libraries/plants/PlantEntry.svelte';
	import type { Library, LibraryEntry } from '$lib/types/library';
	import type { Music } from '$lib/types/library_music';
	import type { Book } from '$lib/types/library_book';
	import type { Link } from '$lib/types/library_link';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { Movie } from '$lib/types/library_movie';
	import type { Game } from '$lib/types/library_game';
	import type { Plant } from '$lib/types/library_plant';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import type { PlantLibrary } from '$lib/state/PlantLibrary.svelte';

	let { entry, library }: {
		entry: LibraryEntry | Link;
		library: Library;
	} = $props();
</script>

{#if library.config.type === 'music'}
	<MusicEntry entry={entry as Music} library={library as MusicLibrary} />
{:else if library.config.type === 'books'}
	<BookEntry entry={entry as Book} library={library as BookLibrary} />
{:else if library.config.type === 'links'}
	<LinkEntry entry={entry as Link} library={library as LinkLibrary} />
{:else if library.config.type === 'recipes'}
	<RecipeEntry entry={entry as Recipe} library={library as RecipeLibrary} />
{:else if library.config.type === 'movies'}
	<MovieEntry entry={entry as Movie} library={library as MovieLibrary} />
{:else if library.config.type === 'games'}
	<GameEntry entry={entry as Game} library={library as GameLibrary} />
{:else if library.config.type === 'plants'}
	<PlantEntry entry={entry as Plant} library={library as PlantLibrary} />
{/if}
