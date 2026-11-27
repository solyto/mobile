<script lang="ts">
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { safeHref } from '$lib/helpers/UrlHelper';

	let { link, artist, title }: {
		link?: string | null;
		artist?: string;
		title?: string;
	} = $props();

	const ts = getTranslation();

	let href = $derived(link ? safeHref(link) : searchUrl());

	function searchUrl(): string {
		return encodeURI('https://www.deezer.com/search/' + artist + ' ' + title);
	}

	function label(): string {
		return (link ? ts.get.libraries.show_on : ts.get.libraries.search_on).replace('%s', 'Deezer');
	}
</script>

{#if href}
	<a
		{href}
		target="_blank"
		rel="external"
		class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-c-btn dark:border-s-dark-3"
	>
		<img src={DeezerIcon} alt={ts.get.libraries.service_icon.replace('%s', 'Deezer')} class="size-6 group-hover:animate-pulse" />
		{label()}
	</a>
{/if}
