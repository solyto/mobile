<script lang="ts">
	import type { Book } from '$lib/types/library_book';
	import type { Music } from '$lib/types/library_music';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { Movie } from '$lib/types/library_movie';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';

	let { entry, library } = $props<{
		entry: Book | Music | Recipe | Movie;
		library: BookLibrary | MusicLibrary | RecipeLibrary | MovieLibrary;
	}>();

	const auth = getAuth();
</script>

{#if entry.cover}
	<div
		class="flex items-center justify-center rounded-lg bg-c-neutral-1 dark:bg-s-dark-3"
		class:size-48={library.config.type === 'music'}
		class:w-48={library.config.type === 'books' ||
			library.config.type === 'movies' ||
			library.config.type === 'recipes' ||
			library.config.type === 'games' ||
			library.config.type === 'plants'}
	>
		<img
			src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`}
			alt={`${entry.artist} - ${entry.title} cover`}
			class="max-h-full max-w-full rounded-lg object-contain transition-all duration-300"
		/>
	</div>
{:else}
	<div
		class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral-1 text-xs text-c-neutral-5 dark:bg-s-dark-3"
	>
		<MissingCover {library} />
	</div>
{/if}
