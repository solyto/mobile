<script lang="ts">
	import { fade } from 'svelte/transition';
	import EntryCover from '$lib/components/libraries/shared/EntryCover.svelte';
	import EntryContent from '$lib/components/libraries/shared/EntryContent.svelte';
	import type { DetailLibrary, Library, LibraryEntry } from '$lib/types/library';
	import type { Link } from '$lib/types/library_link';

	let { library }: { library: Library } = $props();

	function openDetail(entry: LibraryEntry | Link): void {
		(library as DetailLibrary).openDetailModal(entry as LibraryEntry);
	}
</script>

<div class="flex w-full flex-col flex-wrap gap-2 md:p-2">
	{#each library.filteredEntries as entry (entry.id)}
		<button
			onclick={() => openDetail(entry)}
			class="max-w-full cursor-pointer max-md:w-full"
		>
			<div
				class="relative flex touch-manipulation flex-row gap-1 rounded-sm bg-c-bg-surface drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-3"
				class:hover:drop-shadow-xl={library.config.hasCovers}
				transition:fade
			>
				{#if library.config.hasCovers}
					<div
						class="flex max-h-16 items-center justify-start rounded-sm"
						class:max-w-16={library.config.type !== 'recipes'}
						class:max-w-24={library.config.type === 'recipes'}
					>
						<div class="relative flex h-full w-full items-center justify-center">
							<div class="relative flex size-16 h-full w-full items-center justify-center rounded-sm transition-all">
								<EntryCover {entry} {library} />
							</div>
						</div>
					</div>
				{/if}
				<div class="flex w-full p-2 max-md:flex-col md:flex-row md:items-center">
					<EntryContent {entry} {library} />
				</div>
			</div>
		</button>
	{/each}
</div>
