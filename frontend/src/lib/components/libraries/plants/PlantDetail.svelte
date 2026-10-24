<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import { getPlantLibrary } from '$lib/state/PlantLibrary.svelte';
	import type { Plant } from '$lib/types/library_plant';

	const library = getPlantLibrary();
	const entry = library.activeEntry as Plant;
	const ts = getTranslation();
</script>

<DetailModal {entry} {library}>
	{#if entry.name}
		<h2 class="text-xl font-bold">{entry.name}</h2>
	{/if}
	<div class:hidden={!entry.latin_name} class="text-sm italic text-c-neutral-6">
		{entry.latin_name}
	</div>
	<div class="mt-1 flex flex-wrap gap-2 text-sm text-c-neutral-6">
		{#if entry.location}
			<span>{ts.get.libraries.plants[`location_${entry.location}`]}</span>
		{/if}
		{#if entry.sunlight}
			<span>{ts.get.libraries.plants[`sunlight_${entry.sunlight}`]}</span>
		{/if}
		{#if entry.winter_hardy !== null}
			<span>{entry.winter_hardy ? ts.get.libraries.plants.winter_hardy_yes : ts.get.libraries.plants.winter_hardy_no}</span>
		{/if}
	</div>
	{#if entry.current_size || entry.max_size}
		<div class="text-sm text-c-neutral-6">
			{#if entry.current_size && entry.max_size}
				{entry.current_size} · {ts.get.libraries.plants.max_size}: {entry.max_size}
			{:else if entry.current_size}
				{entry.current_size}
			{:else}
				{ts.get.libraries.plants.max_size}: {entry.max_size}
			{/if}
		</div>
	{/if}
	<div class:hidden={entry.acquired_at === null} class="text-sm text-c-neutral-6">
		{entry.acquired_at ? formatDate(entry.acquired_at) : ''}
	</div>
	{#if entry.instructions}
		<Divider />
		<p class="font-semibold">{ts.get.libraries.plants.instructions}</p>
		<p class="mt-1 text-sm">{entry.instructions}</p>
	{/if}
</DetailModal>
