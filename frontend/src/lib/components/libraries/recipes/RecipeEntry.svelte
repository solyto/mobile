<script lang="ts">
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';

	let { entry, library } = $props<{
		entry: Recipe;
		library: RecipeLibrary;
	}>();
</script>

<div class="text-left">
	<div class="font-bold">{entry.title}</div>
</div>
{#if library.view === 'list'}
	<div class="ml-auto flex flex-row items-center gap-4">
		{#if entry.rating}
			<Rating startRating={entry.rating} />
		{/if}
	</div>
{/if}
