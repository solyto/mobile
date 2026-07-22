<script lang="ts">
	import IconStar from '@lucide/svelte/icons/star';
	import type { Library } from '$lib/types/library.js';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { library, toggleMenu } = $props<{
		library: Library;
		toggleMenu: () => void;
	}>();

	const ts = getTranslation();

	function filterByRating(rating: number | null) {
		toggleMenu();
		library.wishlistFilter = false;
		library.addRatingFilter(rating);
	}
</script>

<div
	class="absolute top-0 left-40 z-20 flex min-w-48 flex-col gap-1 rounded-lg bg-c-bg-modal px-2 py-2 shadow-md md:right-0 dark:bg-s-dark-2"
>
	<button
		class="flex cursor-pointer p-1 text-c-warning hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={library.ratingFilter === 1}
		onclick={() => filterByRating(1)}
	>
		<IconStar />
	</button>
	<button
		class="flex cursor-pointer p-1 text-c-warning hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={library.ratingFilter === 2}
		onclick={() => filterByRating(2)}
	>
		<IconStar /><IconStar />
	</button>
	<button
		class="flex cursor-pointer p-1 text-c-warning hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={library.ratingFilter === 3}
		onclick={() => filterByRating(3)}
	>
		<IconStar /><IconStar /><IconStar />
	</button>
	<button
		class="flex cursor-pointer p-1 text-c-warning hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={library.ratingFilter === 4}
		onclick={() => filterByRating(4)}
	>
		<IconStar /><IconStar /><IconStar /><IconStar />
	</button>
	<button
		class="flex cursor-pointer p-1 text-c-warning hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={library.ratingFilter === 5}
		onclick={() => filterByRating(5)}
	>
		<IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
	</button>
	<button
		class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
		onclick={() => filterByRating(null)}
	>
		{ts.get.libraries.clear_filter}
	</button>
</div>
