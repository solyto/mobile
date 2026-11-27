<script lang="ts">
	import type { LibraryConfig, LibraryEntry, LibraryType } from '$lib/types/library';
	import type { Quote } from '$lib/types/library_quote';
	import type { Auth } from '$lib/state/Auth.svelte';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';

	const ts = getTranslation();
	const FIXED_WIDTH_TYPES: LibraryType[] = ['books', 'movies', 'recipes', 'games', 'plants'];

	let { entry, library }: {
		entry: Exclude<LibraryEntry, Quote>;
		library: { auth: Auth; config: LibraryConfig };
	} = $props();

	let failedSrc = $state<string | null>(null);

	function coverName(): string {
		if ('artist' in entry) return `${entry.artist} - ${entry.title}`;
		if ('title' in entry) return entry.title;
		return entry.name ?? entry.latin_name ?? '';
	}

	function coverAlt(): string {
		return ts.get.libraries.cover_of.replace('%s', coverName());
	}

	function hasFixedWidth(): boolean {
		return FIXED_WIDTH_TYPES.includes(library.config.type);
	}
</script>

{#if entry.cover && failedSrc !== libraryCoverUrl(library, entry.cover)}
	<div
		class="flex items-center justify-center rounded-lg bg-c-neutral-1 dark:bg-s-dark-3"
		class:size-48={library.config.type === 'music'}
		class:w-48={hasFixedWidth()}
	>
		<img
			src={libraryCoverUrl(library, entry.cover)}
			alt={coverAlt()}
			class="max-h-full max-w-full rounded-lg object-contain transition-all duration-300"
			onerror={(event) => (failedSrc = (event.currentTarget as HTMLImageElement).getAttribute('src'))}
		/>
	</div>
{:else}
	<div
		class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral-1 text-xs text-c-neutral-5 dark:bg-s-dark-3"
	>
		<MissingCover {library} />
	</div>
{/if}
