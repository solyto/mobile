<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { Recipe } from '$lib/types/library_recipe';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import DOMPurify from 'dompurify';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';

	const library = getRecipeLibrary();
	const entry = library.activeEntry as Recipe;

	const ts = getTranslation();

	const canScale = entry.servings !== null && entry.servings > 0;
	let targetServings = $state<number | null>(entry.servings);

	const factor = $derived(
		canScale && targetServings !== null && targetServings > 0
			? targetServings / entry.servings!
			: 1
	);

	function formatAmount(amount: number): string {
		return parseFloat(amount.toFixed(2)).toString();
	}
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	{#if entry.type}
		<h3 class="text-lg">{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</h3>
	{/if}

	<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-c-neutral-4">
		{#if entry.time_to_make}
			<span>{entry.time_to_make} {ts.get.libraries.recipes.minutes}</span>
		{/if}
		{#if entry.servings}
			<span>{entry.servings} {ts.get.libraries.recipes.servings}</span>
		{/if}
		{#if entry.calories}
			<span>{entry.calories} {ts.get.libraries.recipes.kcal_per_serving}</span>
		{/if}
	</div>

	{#if entry.description}
		<div class="">
			{@html DOMPurify.sanitize(nl2br(entry.description))}
		</div>
	{/if}

	<div class="flex flex-col gap-6 mt-2">
		{#if entry.ingredients.length > 0}
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-4">
					<h3 class="font-bold">{ts.get.libraries.recipes.ingredients}</h3>
					{#if canScale}
						<div class="flex items-center gap-2 text-sm">
							<span>{ts.get.libraries.recipes.portions}</span>
							<div class="w-16">
								<NumberInput bind:value={targetServings} />
							</div>
						</div>
					{/if}
				</div>
				<ul class="flex flex-col gap-1">
					{#each entry.ingredients as ingredient}
						<li class="flex gap-2">
							{#if ingredient.amount !== null}
								<span class="min-w-16 font-medium">
									{formatAmount(ingredient.amount * factor)}{ingredient.unit ? ` ${ingredient.unit}` : ''}
								</span>
							{:else if ingredient.unit}
								<span class="min-w-16 font-medium">{ingredient.unit}</span>
							{/if}
							<span>{ingredient.name}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if entry.steps.length > 0}
			<div class="flex flex-col gap-4">
				<h3 class="font-bold">{ts.get.libraries.recipes.steps}</h3>
				{#each entry.steps as step, i}
					<div class="flex flex-row items-start gap-4">
						<span class="rounded-full bg-c-neutral-1 size-6 flex justify-center items-center text-xs">{i+1}</span>
						<div>{@html DOMPurify.sanitize(nl2br(step))}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</DetailModal>
