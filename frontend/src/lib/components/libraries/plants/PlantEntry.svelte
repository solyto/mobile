<script lang="ts">
	import type { Plant } from '$lib/types/library_plant';
	import type { PlantLibrary } from '$lib/state/PlantLibrary.svelte';

	let { entry, library }: {
		entry: Plant;
		library: PlantLibrary;
	} = $props();
</script>

<div class="text-left">
	{#if entry.name}
		<div class="font-bold" class:truncate={library.view === 'cards'} class:text-sm={library.view === 'cards'} title={entry.name}>{entry.name}</div>
	{/if}
	{#if entry.latin_name}
		<div class="text-sm italic text-c-neutral-6" class:truncate={library.view === 'cards'} title={entry.latin_name}>{entry.latin_name}</div>
	{/if}

</div>
