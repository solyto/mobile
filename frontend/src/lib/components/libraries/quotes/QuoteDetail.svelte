<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import DOMPurify from 'dompurify';
	import Divider from '$lib/components/ui/Divider.svelte';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import { getQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import type { Quote } from '$lib/types/library_quote';

	const library = getQuoteLibrary();
	const entry = library.activeEntry as Quote;

	const ts = getTranslation();
</script>

<DetailModal {entry} {library}>
	{#if entry.author !== null}
		<div class="text-lg font-bold">{entry.author}</div>
	{/if}
	<div class:mt-4={entry.author !== null}>
		{@html DOMPurify.sanitize(nl2br(entry.quote))}
	</div>
	<div class="mt-4" class:hidden={entry.summary === null}>
		<Divider />
		{@html DOMPurify.sanitize(entry.summary ? nl2br(entry.summary) : '')}
	</div>
	<div class:hidden={entry.tags.length === 0} class="mt-4 text-sm text-c-neutral-6">
		{entry.tags.map((t) => t.name).join(', ')}
	</div>
	<div class="mt-4" class:hidden={entry.source === null}>
		<Divider />
		<span class="font-bold">{ts.get.libraries.quotes.source}: </span>
		{#if entry.source?.startsWith('http')}
			<a href={entry.source} target="_blank" rel="external">{entry.source}</a>
		{:else}
			{entry.source}
		{/if}
	</div>
</DetailModal>
