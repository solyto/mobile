<script lang="ts">
	import type { Library } from '$lib/types/library.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { MusicGenre } from '$lib/types/library_music';
	import type { BookGenre } from '$lib/types/library_book';

	let { library, toggleMenu } = $props<{
		library: Library;
		toggleMenu: () => void;
	}>();

	const ts = getTranslation();

	function filterByGenre(genre: MusicGenre | BookGenre | null) {
		toggleMenu();
		library.wishlistFilter = false;
		library.addGenreFilter(genre);
	}
</script>

<div
	class="absolute top-0 left-40 z-20 flex min-w-48 flex-col gap-1 rounded-lg bg-c-bg-modal px-2 py-2 shadow-md md:right-0 dark:bg-s-dark-2"
>
	{#each library.genres as genre (genre.id)}
		<button
			class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
			class:bg-c-neutral-1={library.genreFilter?.id === genre.id}
			onclick={() => filterByGenre(genre)}
		>
			{genre.title}
		</button>
	{/each}
	<button
		class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
		onclick={() => filterByGenre(null)}
	>
		{ts.get.libraries.clear_filter}
	</button>
</div>
