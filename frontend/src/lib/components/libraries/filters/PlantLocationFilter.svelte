<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getPlantLibrary } from '$lib/state/PlantLibrary.svelte';
	import type { PlantLocation } from '$lib/types/library_plant';

	const ts = getTranslation();
	const library = getPlantLibrary();

	let { toggleMenu } = $props<{
		toggleMenu: () => void;
	}>();

	let submenuVisible = $state<boolean>(false);

	const locationOptions: { key: PlantLocation; label: string }[] = [
		{ key: 'indoor', label: ts.get.libraries.plants.location_indoor },
		{ key: 'outdoor', label: ts.get.libraries.plants.location_outdoor }
	];

	function toggleSubmenu() {
		submenuVisible = !submenuVisible;
	}

	function filterByLocation(location: PlantLocation | null) {
		toggleMenu();
		library.addLocationFilter(location);
	}
</script>

<button
	class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral-1={library.locationFilter}
	onclick={toggleSubmenu}
>
	{ts.get.libraries.plants.location}
</button>
{#if submenuVisible}
	<div
		class="absolute top-0 z-20 flex min-w-48 flex-col gap-1 rounded-lg bg-c-bg-modal px-2 py-2 shadow-md md:right-0 dark:bg-s-dark-2"
		style="right: 190px;"
	>
		{#each locationOptions as option (option.key)}
			<button
				class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={library.locationFilter === option.key}
				onclick={() => filterByLocation(option.key)}
			>
				{option.label}
			</button>
		{/each}
		<button
			class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
			onclick={() => filterByLocation(null)}
		>
			{ts.get.libraries.clear_filter}
		</button>
	</div>
{/if}
<button
	class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral-1={library.unidentifiedFilter}
	onclick={() => { toggleMenu(); library.filterByUnidentified(); }}
>
	{ts.get.libraries.plants.unidentified}
</button>
