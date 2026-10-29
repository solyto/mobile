<script lang="ts">
	import { fade } from 'svelte/transition';
	import QuoteEntry from '$lib/components/libraries/quotes/QuoteEntry.svelte';
	import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';

	let { library }: { library: QuoteLibrary } = $props();
</script>

<div class="flex w-full flex-col md:p-2">
	{#each library.filteredEntries as entry, index (entry.id)}
		{#if index > 0}
			<div class="mx-auto my-2 h-px w-24 bg-c-neutral-2 md:ml-4 dark:bg-s-dark-3"></div>
		{/if}
		<button onclick={() => library.openDetailModal(entry)} class="w-full cursor-pointer">
			<div
				class="rounded-sm p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				transition:fade
			>
				<QuoteEntry {entry} />
			</div>
		</button>
	{/each}
</div>
