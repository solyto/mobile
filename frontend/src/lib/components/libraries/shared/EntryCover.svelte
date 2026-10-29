<script lang="ts">
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
	import type { Library, LibraryEntry } from '$lib/types/library';
	import type { Link } from '$lib/types/library_link';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';

	const auth = getAuth();

	let { entry, library, fill = false }: {
		entry: LibraryEntry | Link;
		library: Library;
		fill?: boolean;
	} = $props();

	function previewFilename(cover: string): string {
		const dot = cover.lastIndexOf('.');
		return dot === -1 ? cover + '_preview' : cover.slice(0, dot) + '_preview' + cover.slice(dot);
	}
</script>

<MissingCover {library} />
{#if 'cover' in entry && entry.cover}
	<CoverImage
		src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${previewFilename(entry.cover)}`}
		alt=""
		class="pointer-events-none absolute inset-0 top-0 left-0 h-full w-full object-cover opacity-10 blur-xs"
	/>
	<CoverImage
		src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`}
		previewSrc={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${previewFilename(entry.cover)}`}
		alt="Cover"
		class="z-30 h-full w-full rounded-sm {fill ? 'object-cover' : 'object-contain'}"
	/>
{/if}
