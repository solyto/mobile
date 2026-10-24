<script lang="ts">
	import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
	import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
	import type { LibraryEntry } from '$lib/types/library';
	import type { Quote } from '$lib/types/library_quote';

	let { entry }: {
		entry: Exclude<LibraryEntry, Quote>;
	} = $props();
</script>

{#if (!entry.link || !entry.link.includes('deezer')) && 'artist' in entry}
	<DeezerButton artist={entry.artist} title={entry.title} />
{/if}
{#if (!entry.link || !entry.link.includes('hardcover')) && 'author' in entry}
	<HardcoverButton author={entry.author} title={entry.title} />
{/if}
