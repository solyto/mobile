<script lang="ts">
	import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
	import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
	import type { Book } from '$lib/types/library_book';
	import type { Music } from '$lib/types/library_music';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { Movie } from '$lib/types/library_movie';

	let { entry } = $props<{
		entry: Book | Music | Recipe | Movie;
	}>();
</script>

{#if (!entry.link || !entry.link.includes('deezer')) && 'artist' in entry}
	<DeezerButton artist={entry.artist} title={entry.title} />
{/if}
{#if (!entry.link || !entry.link.includes('hardcover')) && 'author' in entry}
	<HardcoverButton author={entry.author} title={entry.title} />
{/if}
