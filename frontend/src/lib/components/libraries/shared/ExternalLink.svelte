<script lang="ts">
	import DiscogsIcon from '$lib/assets/services/discogs_icon.png';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import IconHardcover from '$lib/components/ui/icons/IconHardcover.svelte';
	import GoodreadsIcon from '$lib/assets/services/goodreads_icon.png';
	import ImdbIcon from '$lib/assets/services/imdb_icon.svg';
	import IconChefkoch from '$lib/components/ui/icons/IconChefkoch.svelte';
	import type { Book } from '$lib/types/library_book.js';
	import type { Music } from '$lib/types/library_music.js';
	import type { Recipe } from '$lib/types/library_recipe.js';
	import type { Movie } from '$lib/types/library_movie.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import ExternalSearchLink from '$lib/components/libraries/shared/ExternalSearchLink.svelte';

	let { entry } = $props<{
		entry: Book | Music | Recipe | Movie;
	}>();

	const ts = getTranslation();
</script>

<div class="mt-2 flex flex-col">
	{#if entry.link}
		<a
			href={entry.link}
			target="_blank"
			rel="external"
			class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-c-btn dark:border-s-dark-3"
		>
			{#if entry.link.includes('discogs')}
				<img
					src={DiscogsIcon}
					alt="Discogs icon"
					class="size-6 group-hover:animate-pulse"
				/>
				{ts.get.libraries.show_on.replace('%s', 'Discogs')}
			{:else if entry.link.includes('deezer')}
				<img src={DeezerIcon} alt="Deezer icon" class="size-6 group-hover:animate-pulse" />
				{ts.get.libraries.show_on.replace('%s', 'deezer')}
			{:else if entry.link.includes('hardcover')}
				<IconHardcover /> {ts.get.libraries.show_on.replace('%s', 'Hardcover')}
			{:else if entry.link.includes('goodreads')}
				<img
					src={GoodreadsIcon}
					alt="Goodreads icon"
					class="size-6 group-hover:animate-pulse"
				/>
				{ts.get.libraries.show_on.replace('%s', 'goodreads')}
			{:else if entry.link.includes('chefkoch')}
				<IconChefkoch /> {ts.get.libraries.show_on.replace('%s', 'Chefkoch')}
			{:else if entry.link.includes('imdb')}
				<img src={ImdbIcon} alt="IMDb icon" class="size-6 group-hover:animate-pulse" />
				{ts.get.libraries.show_on.replace('%s', 'IMDb')}
			{:else}
				<img
					src={grabFaviconFromUrl(entry.link)}
					alt="Favicon"
					class="size-6 group-hover:animate-pulse"
				/> External link
			{/if}
		</a>
	{/if}
	<ExternalSearchLink {entry} />
</div>
