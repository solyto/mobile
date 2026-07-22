<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconHardcover from '$lib/components/ui/icons/IconHardcover.svelte';

	let { link, author, title } = $props<{
		link?: string;
		author?: string;
		title?: string;
	}>();

	const ts = getTranslation();

	const getHardcoverUrl = (): string =>
		encodeURI('https://hardcover.app/search?q=' + author + ' ' + title);
</script>

<a
	href={link ? link : getHardcoverUrl()}
	target="_blank"
	rel="external"
	class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-c-btn dark:border-s-dark-3"
>
	<div class="group-hover:animate-pulse"><IconHardcover /></div>
	{link
		? ts.get.libraries.show_on.replace('%s', 'Hardcover')
		: ts.get.libraries.search_on.replace('%s', 'Hardcover')}
</a>
