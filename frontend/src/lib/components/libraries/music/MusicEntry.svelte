<script lang="ts">
	import type { Music } from '$lib/types/library_music';
	import { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
	import Flag from '$lib/components/ui/Flag.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { entry, library } = $props<{
		entry: Music;
		library: MusicLibrary;
	}>();
</script>

{#if entry.wishlist}
	<Flag title={ts.get.libraries.wishlist} />
{/if}
<div class="text-left">
	<div class="font-bold">{entry.title}</div>
	<div class="text-sm">{entry.artist}</div>
</div>
{#if library.view === 'list'}
	<div class="ml-auto flex flex-row items-center gap-4">
		<GenreFlexList genres={entry.genres} />
		{#if entry.rating}
			<Rating startRating={entry.rating} />
		{/if}
	</div>
{/if}
