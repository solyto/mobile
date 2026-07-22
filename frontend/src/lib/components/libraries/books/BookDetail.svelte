<script lang="ts">
	import type { Book } from '$lib/types/library_book';
	import { getBookLibrary } from '$lib/state/BookLibrary.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';

	const library = getBookLibrary();
	const entry = library.activeEntry as Book;

	const ts = getTranslation();
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	<h3 class="text-lg">{entry.author}</h3>
	<div class="text-sm text-c-neutral-5" class:hidden={entry.series === null}>
		{entry.series}{entry.volume ? ' (' + entry.volume + ')' : ''}
	</div>
	<div class="text-sm text-c-neutral-6">
		{entry.genres.map((g) => g.title).join(', ')}
	</div>
	<div class:hidden={entry.tags.length === 0} class="text-sm text-c-neutral-6">
		{entry.tags.map((t) => t.name).join(', ')}
	</div>
	<div class="text-sm" class:hidden={entry.publication_year === null}>
		{entry.publication_year}
	</div>
	<div class:hidden={entry.pages === null && entry.current_page === null}>
		<span>{entry.pages ?? 0} {ts.get.libraries.books.pages} ({entry.current_page ?? 0})</span>
	</div>
	<div class:hidden={entry.started_at === null}>
		{ts.get.libraries.books.started_at}
		{entry.started_at ? formatDate(entry.started_at) : ''}
	</div>
	<div class:hidden={entry.finished_at === null}>
		{ts.get.libraries.books.finished_at}
		{entry.finished_at ? formatDate(entry.finished_at) : ''}
	</div>
	<div class:hidden={entry.is_where === null}>
		{entry.is_where}
	</div>
	<div class:hidden={entry.lent_to === null}>
		{ts.get.libraries.books.lent_to}
		{entry.lent_to}
	</div>
	{#if entry.summary}
		<Divider />
		<p>{entry.summary}</p>
	{/if}
</DetailModal>
