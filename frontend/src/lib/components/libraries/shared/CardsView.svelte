<script lang="ts">
	import { fade } from 'svelte/transition';
	import EntryCover from '$lib/components/libraries/shared/EntryCover.svelte';
	import EntryContent from '$lib/components/libraries/shared/EntryContent.svelte';
	import type { Library, LibraryEntry, LibraryType } from '$lib/types/library';

	let { library }: { library: Library } = $props();

	const coverAspects: Partial<Record<LibraryType, string>> = {
		music: 'aspect-square',
		books: 'aspect-[2/3]',
		movies: 'aspect-[2/3]',
		recipes: 'aspect-[3/4]',
		plants: 'aspect-[3/4]',
		games: 'aspect-[460/215]'
	};

	function isWide(): boolean {
		return library.config.type === 'games';
	}
</script>

<div
	class={[
		'grid w-full items-start gap-4',
		isWide() ? 'md:grid-cols-[repeat(auto-fill,minmax(24rem,1fr))]' : 'grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]'
	]}
>
	{#each library.filteredEntries as entry (entry.id)}
		<button
			onclick={() => (library as { openDetailModal(entry: LibraryEntry): void }).openDetailModal(entry as LibraryEntry)}
			class="w-full min-w-0 cursor-pointer"
		>
			<div class="group relative flex w-full touch-manipulation flex-col rounded-sm transition-all" transition:fade>
				<div
					class={[
						'flex items-center justify-start overflow-hidden rounded-sm bg-c-bg-surface drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 group-hover:bg-c-neutral group-hover:drop-shadow-xl dark:group-hover:bg-s-dark-3',
						coverAspects[library.config.type]
					]}
				>
					<div class="relative flex h-full w-full items-center justify-center">
						<div class="relative flex h-full w-full items-center justify-center rounded-sm transition-all">
							<EntryCover {entry} {library} fill />
						</div>
					</div>
				</div>
				<div class="flex flex-col py-2">
					<EntryContent {entry} {library} />
				</div>
			</div>
		</button>
	{/each}
</div>
