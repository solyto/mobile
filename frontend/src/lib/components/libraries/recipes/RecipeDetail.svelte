<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { Recipe } from '$lib/types/library_recipe';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import DOMPurify from 'dompurify';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';

	const library = getRecipeLibrary();
	const entry = library.activeEntry as Recipe;

	const ts = getTranslation();
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	{#if entry.type}
		<h3 class="text-lg">{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</h3>
	{/if}
	{#if entry.time_to_make}
		<div>
			{entry.time_to_make}
			{ts.get.libraries.recipes.minutes}
		</div>
	{/if}
	{#if entry.ingredients}
		<div>
			{ts.get.libraries.recipes.ingredients}: {entry.ingredients}
		</div>
	{/if}
	{#if entry.description}
		<div>
			{@html DOMPurify.sanitize(nl2br(entry.description))}
		</div>
	{/if}
</DetailModal>
