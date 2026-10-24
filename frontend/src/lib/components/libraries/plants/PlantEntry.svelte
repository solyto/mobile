<script lang="ts">
	import type { Plant } from '$lib/types/library_plant';

	let { entry }: {
		entry: Plant;
	} = $props();
</script>

<div class="text-left">
	{#if entry.name}
		<div class="font-bold">{entry.name}</div>
	{/if}
	{#if entry.latin_name}
		<div class="text-sm italic text-c-neutral-6">{entry.latin_name}</div>
	{/if}

</div>
