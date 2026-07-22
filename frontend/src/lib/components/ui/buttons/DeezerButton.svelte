<script lang="ts">
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { link, artist, title } = $props<{
		link?: string;
		artist?: string;
		title?: string;
	}>();

	const ts = getTranslation();

	const getDeezerUrl = (): string =>
		encodeURI('https://www.deezer.com/search/' + artist + ' ' + title);
</script>

<a
	href={link ? link : getDeezerUrl()}
	target="_blank"
	rel="external"
	class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-c-btn dark:border-s-dark-3"
>
	<img src={DeezerIcon} alt="Deezer icon" class="size-6 group-hover:animate-pulse" />
	{link
		? ts.get.libraries.show_on.replace('%s', 'Deezer')
		: ts.get.libraries.search_on.replace('%s', 'Deezer')}
</a>
