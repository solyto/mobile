<script lang="ts">
	import type { Book } from '$lib/types/library_book';
	import { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import Flag from '$lib/components/ui/Flag.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { entry, library } = $props<{
		entry: Book;
		library: BookLibrary;
	}>();
</script>

{#if entry.wishlist}
	<Flag title={ts.get.libraries.wishlist} />
{/if}
<div class="text-left">
	{#if library.view === 'list' && entry.series}
		<div class="font-bold">{entry.title} ({entry.series})</div>
	{:else}
		<div class="font-bold">{entry.title}</div>
	{/if}
	<div class="text-sm">{entry.author}</div>
	{#if library.view === 'cards'}
		{#if entry.series}
			<div class="text-sm text-c-neutral-5">
				{entry.series}{entry.volume ? ' (' + entry.volume + ')' : ''}
			</div>
		{/if}
	{/if}
</div>
{#if library.view === 'list'}
	<div class="ml-auto flex flex-row items-center gap-4">
		<TagFlexList tags={entry.tags} />
		<GenreFlexList genres={entry.genres} />
		{#if entry.rating}
			<Rating startRating={entry.rating} />
		{/if}
	</div>
{/if}
