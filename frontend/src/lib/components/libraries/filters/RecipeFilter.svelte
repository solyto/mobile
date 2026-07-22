<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { RecipeType } from '$lib/types/library_recipe';

	const ts = getTranslation();
	const recipes = getRecipeLibrary();

	let { toggleMenu } = $props<{
		toggleMenu: () => void;
	}>();

	let submenuVisible = $state<boolean>(false);

	const typeOptions: { key: RecipeType; label: string }[] = [
		{ key: 'breakfast', label: ts.get.libraries.recipes.type_breakfast },
		{ key: 'lunch', label: ts.get.libraries.recipes.type_lunch },
		{ key: 'dinner', label: ts.get.libraries.recipes.type_dinner },
		{ key: 'snack', label: ts.get.libraries.recipes.type_snack },
		{ key: 'dessert', label: ts.get.libraries.recipes.type_dessert },
		{ key: 'drink', label: ts.get.libraries.recipes.type_drink },
		{ key: 'other', label: ts.get.libraries.recipes.type_other }
	];

	function toggleSubmenu() {
		submenuVisible = !submenuVisible;
	}

	function filterByType(type: RecipeType | null) {
		toggleMenu();
		recipes.addTypeFilter(type);
	}
</script>

<button
	class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral-1={recipes.typeFilter}
	onclick={toggleSubmenu}
>
	{ts.get.libraries.recipes.type}
</button>
{#if submenuVisible}
	<div
		class="absolute top-0 z-20 flex min-w-48 flex-col gap-1 rounded-lg bg-c-bg-modal px-2 py-2 shadow-md md:right-0 dark:bg-s-dark-2"
		style="right: 190px;"
	>
		{#each typeOptions as type (type.key)}
			<button
				class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={recipes.typeFilter === type.key}
				onclick={() => filterByType(type.key)}
			>
				{type.label}
			</button>
		{/each}
		<button
			class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
			onclick={() => filterByType(null)}
		>
			{ts.get.libraries.clear_filter}
		</button>
	</div>
{/if}
