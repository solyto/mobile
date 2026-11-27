<script lang="ts">
	import DiscogsIcon from '$lib/assets/services/discogs_icon.svg';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import IconHardcover from '$lib/components/ui/icons/IconHardcover.svelte';
	import GoodreadsIcon from '$lib/assets/services/goodreads_icon.svg';
	import ImdbIcon from '$lib/assets/services/imdb_icon.svg';
	import IconChefkoch from '$lib/components/ui/icons/IconChefkoch.svelte';
	import type { LibraryEntry } from '$lib/types/library';
	import type { Quote } from '$lib/types/library_quote';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import ExternalSearchLink from '$lib/components/libraries/shared/ExternalSearchLink.svelte';
	import { safeHref } from '$lib/helpers/UrlHelper';

	let { entry }: {
		entry: Exclude<LibraryEntry, Quote>;
	} = $props();

	const ts = getTranslation();
	const ICON = 'size-6 group-hover:animate-pulse';

	let href = $derived(safeHref(entry.link));

	function showOn(service: string): string {
		return ts.get.libraries.show_on.replace('%s', service);
	}

	function iconAlt(service: string): string {
		return ts.get.libraries.service_icon.replace('%s', service);
	}
</script>

<div class="mt-2 flex flex-col">
	{#if entry.link && href}
		<a
			{href}
			target="_blank"
			rel="external"
			class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-c-btn dark:border-s-dark-3"
		>
			{#if entry.link.includes('discogs')}
				<img src={DiscogsIcon} alt={iconAlt('Discogs')} class={ICON} />
				{showOn('Discogs')}
			{:else if entry.link.includes('deezer')}
				<img src={DeezerIcon} alt={iconAlt('Deezer')} class={ICON} />
				{showOn('deezer')}
			{:else if entry.link.includes('hardcover')}
				<IconHardcover /> {showOn('Hardcover')}
			{:else if entry.link.includes('goodreads')}
				<img src={GoodreadsIcon} alt={iconAlt('Goodreads')} class={ICON} />
				{showOn('goodreads')}
			{:else if entry.link.includes('chefkoch')}
				<IconChefkoch /> {showOn('Chefkoch')}
			{:else if entry.link.includes('imdb')}
				<img src={ImdbIcon} alt={iconAlt('IMDb')} class={ICON} />
				{showOn('IMDb')}
			{:else}
				<img src={grabFaviconFromUrl(entry.link)} alt={ts.get.libraries.favicon} class={ICON} />
				{ts.get.libraries.external_link}
			{/if}
		</a>
	{/if}
	<ExternalSearchLink {entry} />
</div>
