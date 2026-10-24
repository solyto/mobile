<script lang="ts">
	import type { LibraryConfig, LibraryEntry } from '$lib/types/library';
	import type { Quote } from '$lib/types/library_quote';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';

	let { entry, library }: {
		entry: Exclude<LibraryEntry, Quote>;
		library: { config: LibraryConfig };
	} = $props();

	const auth = getAuth();

	function coverAlt(): string {
		if ('artist' in entry) return `${entry.artist} - ${entry.title} cover`;
		if ('name' in entry) return `${entry.name} cover`;
		return `${entry.title} cover`;
	}
</script>

{#if entry.cover}
	<div
		class="flex items-center justify-center rounded-lg bg-c-neutral-1 dark:bg-s-dark-3"
		class:size-48={library.config.type === 'music'}
		class:w-48={library.config.type === 'books' ||
			library.config.type === 'movies' ||
			library.config.type === 'recipes' ||
			library.config.type === 'games' ||
			library.config.type === 'plants'}
	>
		<img
			src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`}
			alt={coverAlt()}
			class="max-h-full max-w-full rounded-lg object-contain transition-all duration-300"
		/>
	</div>
{:else}
	<div
		class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral-1 text-xs text-c-neutral-5 dark:bg-s-dark-3"
	>
		<MissingCover {library} />
	</div>
{/if}
