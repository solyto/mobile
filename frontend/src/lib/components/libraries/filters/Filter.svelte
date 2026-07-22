<script lang="ts">
	import IconFunnel from '@lucide/svelte/icons/funnel';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { Library } from '$lib/types/library';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import RecipeFilter from '$lib/components/libraries/filters/RecipeFilter.svelte';
	import RatingFilter from '$lib/components/libraries/filters/RatingFilter.svelte';
	import GenreFilter from '$lib/components/libraries/filters/GenreFilter.svelte';
	import LentBookFilter from '$lib/components/libraries/filters/LentBookFilter.svelte';
	import PlantLocationFilter from '$lib/components/libraries/filters/PlantLocationFilter.svelte';

	const ts = getTranslation();

	let { library } = $props<{ library: Library }>();

	let visibility = $state<{
		menu: boolean;
		genreMenu: boolean;
		ratingMenu: boolean;
	}>({ menu: false, genreMenu: false, ratingMenu: false });

	function toggleMenu() {
		visibility.menu = !visibility.menu;

		if (!visibility.menu) {
			visibility.genreMenu = false;
			visibility.ratingMenu = false;
		}
	}

	function toggleGenreMenu() {
		visibility.ratingMenu = false;
		visibility.genreMenu = !visibility.genreMenu;
	}

	function toggleRatingMenu() {
		visibility.genreMenu = false;
		visibility.ratingMenu = !visibility.ratingMenu;
	}

	function filterByWishlist() {
		toggleMenu();
		library.genreFilter = null;
		library.ratingFilter = null;
		library.filterByWishlist();
	}

	function clearFilters() {
		toggleMenu();
		library.clearFilters();
	}
</script>

<div class="relative">
	<button
		class="flex cursor-pointer items-center justify-center rounded-lg p-2"
		class:bg-c-neutral={library.genreFilter || library.ratingFilter || library.wishlistFilter || library.locationFilter || library.unidentifiedFilter}
		onclick={toggleMenu}
	>
		<IconFunnel />
	</button>
	{#if visibility.menu}
		<div
			class="absolute top-0 left-0 z-20 flex min-w-48 flex-col gap-1 rounded-lg bg-c-bg-modal px-2 py-2 shadow-md md:right-0 dark:bg-s-dark-2"
			use:clickOutside={() => {
				toggleMenu();
			}}
		>
			{#if library.config.hasGenres}
				<button
					class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={library.genreFilter}
					onclick={toggleGenreMenu}
				>
					{ts.get.libraries.genres}
				</button>
			{/if}
			{#if library.config.hasRatings}
				<button
					class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={library.ratingFilter}
					onclick={toggleRatingMenu}
				>
					{ts.get.libraries.rating}
				</button>
			{/if}
			{#if library.config.hasWishlist}
				<button
					class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={library.wishlistFilter}
					onclick={filterByWishlist}
				>
					{ts.get.libraries.wishlist}
				</button>
			{/if}
			{#if library.config.type === 'books'}
				<LentBookFilter {toggleMenu} />
			{/if}
			{#if library.config.type === 'recipes'}
				<RecipeFilter {toggleMenu} />
			{/if}
			{#if library.config.type === 'plants'}
				<PlantLocationFilter {toggleMenu} />
			{/if}
			<button
				class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={clearFilters}
			>
				{ts.get.libraries.clear_all_filters}
			</button>
			{#if visibility.genreMenu}
				<GenreFilter {library} {toggleMenu} />
			{/if}
			{#if visibility.ratingMenu}
				<RatingFilter {library} {toggleMenu} />
			{/if}
		</div>
	{/if}
</div>
