<script lang="ts">
	import { fade } from 'svelte/transition';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ShelfView from '$lib/components/libraries/shared/ShelfView.svelte';
	import SpineView from '$lib/components/libraries/shared/SpineView.svelte';
	import BookEntry from '$lib/components/libraries/books/BookEntry.svelte';
	import MusicEntry from '$lib/components/libraries/music/MusicEntry.svelte';
	import LinkEntry from '$lib/components/libraries/links/LinkEntry.svelte';
	import QuoteEntry from '$lib/components/libraries/quotes/QuoteEntry.svelte';
	import RecipeEntry from '$lib/components/libraries/recipes/RecipeEntry.svelte';
	import MovieEntry from '$lib/components/libraries/movies/MovieEntry.svelte';
	import GameEntry from '$lib/components/libraries/games/GameEntry.svelte';
	import PlantEntry from '$lib/components/libraries/plants/PlantEntry.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
	import type { Library, LibraryEntry } from '$lib/types/library';
	import type { Music } from '$lib/types/library_music';
	import type { Book } from '$lib/types/library_book';
	import type { Link } from '$lib/types/library_link';
	import type { Quote } from '$lib/types/library_quote';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { Movie } from '$lib/types/library_movie';
	import type { Game } from '$lib/types/library_game';
	import type { Plant } from '$lib/types/library_plant';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const auth = getAuth();
	const ts = getTranslation();

	let { library }: { library: Library } = $props();

	let view = $derived(library.view);

	function previewFilename(cover: string): string {
		const dot = cover.lastIndexOf('.');
		return dot === -1 ? cover + '_preview' : cover.slice(0, dot) + '_preview' + cover.slice(dot);
	}
</script>

{#if library.loaded && library.entries.length === 0}
	<EmptyState title={ts.get.libraries.no_entries} description={ts.get.libraries.no_entries_desc} />
{:else if library.loaded && library.filteredEntries.length === 0}
	<EmptyState title={ts.get.libraries.no_results} description={ts.get.libraries.no_results_desc} />
{:else if view === 'shelf'}
	<ShelfView library={library as MusicLibrary | BookLibrary} />
{:else if view === 'spine'}
	<SpineView {library} />
{/if}

<div
	class="flex w-full flex-wrap"
	class:hidden={view === 'shelf' || view === 'spine' || library.filteredEntries.length === 0}
	class:md:p-2={view === 'list'}
	class:flex-col={view === 'list'}
	class:gap-2={view === 'list'}
	class:flex-row={view === 'cards'}
	class:gap-4={view === 'cards'}
	class:items-start={view === 'cards'}
>
	{#each library.filteredEntries as entry (entry.id)}
		<button
			onclick={() => {
				if (library.config.type !== 'links') (library as { openDetailModal(entry: LibraryEntry): void }).openDetailModal(entry as LibraryEntry);
			}}
			class="max-w-full cursor-pointer max-md:w-full"
		>
			<div
				class="relative flex touch-manipulation rounded-sm bg-c-bg-surface drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-3"
				class:hover:drop-shadow-xl={library.config.hasCovers}
				class:flex-col={view === 'cards'}
				class:flex-row={view === 'list'}
				class:md:max-w-48={view === 'cards'}
				class:gap-1={view === 'list'}
				transition:fade
			>
				<div
					class="flex items-center justify-start rounded-sm"
					class:max-h-16={view === 'list'}
					class:md:max-w-48={view === 'cards'}
					class:max-md:justify-center={view === 'cards'}
					class:max-w-16={view === 'list' &&
						(library.config.type === 'books' ||
							library.config.type === 'movies' ||
							library.config.type === 'music' ||
							library.config.type === 'games' ||
							library.config.type === 'plants')}
					class:max-w-24={view === 'list' && library.config.type === 'recipes'}
					class:md:aspect-square={library.config.type === 'music'}
					class:hidden={!library.config.hasCovers}
				>
					<div class="relative flex h-full w-full items-center justify-center">
						<div
							class="relative flex h-full w-full items-center justify-center rounded-sm transition-all"
							class:md:w-48={library.view === 'cards'}
							class:min-h-48={library.view === 'cards'}
							class:max-h-48={library.view === 'cards' && library.config.type === 'games'}
							class:overflow-hidden={library.view === 'cards' && library.config.type === 'games'}
							class:max-md:w-full={library.view === 'cards'}
							class:size-16={library.view === 'list'}
						>
							<MissingCover {library} />
							{#if 'cover' in entry && entry.cover}
								<CoverImage
									src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${previewFilename(entry.cover)}`}
									alt=""
									class="pointer-events-none absolute inset-0 top-0 left-0 h-full w-full object-cover opacity-10 blur-xs"
								/>
								<CoverImage
									src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`}
									previewSrc={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${previewFilename(entry.cover)}`}
									alt="Cover"
									class="z-30 h-full w-full rounded-sm object-contain"
								/>
							{/if}
						</div>
					</div>
				</div>
				<div
					class="flex p-2"
					class:flex-col={view === 'cards'}
					class:md:flex-row={view === 'list'}
					class:max-md:flex-col={view === 'list'}
					class:max-md:items-start-start={view === 'list'}
					class:w-full={view === 'list'}
					class:md:items-center={view === 'list'}
				>
					{#if library.config.type === 'music'}
						<MusicEntry entry={entry as Music} library={library as MusicLibrary} />
					{:else if library.config.type === 'books'}
						<BookEntry entry={entry as Book} library={library as BookLibrary} />
					{:else if library.config.type === 'links'}
						<LinkEntry entry={entry as Link} library={library as LinkLibrary} />
					{:else if library.config.type === 'quotes'}
						<QuoteEntry entry={entry as Quote} library={library as QuoteLibrary} />
					{:else if library.config.type === 'recipes'}
						<RecipeEntry entry={entry as Recipe} library={library as RecipeLibrary} />
					{:else if library.config.type === 'movies'}
						<MovieEntry entry={entry as Movie} library={library as MovieLibrary} />
					{:else if library.config.type === 'games'}
						<GameEntry entry={entry as Game} library={library as GameLibrary} />
					{:else if library.config.type === 'plants'}
						<PlantEntry entry={entry as Plant} />
					{/if}
				</div>
			</div>
		</button>
	{/each}
</div>

<!-- h-12 w-12 aspect-square max-w-48 -->
