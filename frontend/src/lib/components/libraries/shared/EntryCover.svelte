<script lang="ts">
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
	import type { Library, LibraryEntry } from '$lib/types/library';
	import type { Link } from '$lib/types/library_link';
	import { libraryCoverUrl, previewFilename } from '$lib/helpers/LibraryCoverHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { entry, library, fit = 'object-contain' }: {
		entry: LibraryEntry | Link;
		library: Library;
		fit?: 'object-contain' | 'object-cover';
	} = $props();

	function coverUrl(cover: string): string {
		return libraryCoverUrl(library, cover);
	}

	function previewUrl(cover: string): string {
		return libraryCoverUrl(library, previewFilename(cover));
	}
</script>

<MissingCover {library} />
{#if 'cover' in entry && entry.cover}
	<CoverImage
		src={previewUrl(entry.cover)}
		alt=""
		class="pointer-events-none absolute inset-0 top-0 left-0 h-full w-full object-cover opacity-10 blur-xs"
	/>
	<CoverImage
		src={coverUrl(entry.cover)}
		previewSrc={previewUrl(entry.cover)}
		alt={ts.get.libraries.cover}
		class="z-30 h-full w-full rounded-sm {fit}"
	/>
{/if}
