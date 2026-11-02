<script lang="ts">
	import LinkEntry from '$lib/components/libraries/links/LinkEntry.svelte';
	import type { LinkLibrary } from '$lib/state/LinkLibrary.svelte';

	let { library }: { library: LinkLibrary } = $props();
</script>

<div class="flex w-full flex-col divide-y md:p-2">
	{#each library.filteredEntries as entry (entry.id)}
		<LinkEntry {entry} {library} showCategory={typeof library.activeFilter !== 'number'} />
	{/each}
</div>
