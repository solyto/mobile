<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ShelfView from '$lib/components/libraries/shared/ShelfView.svelte';
	import SpineView from '$lib/components/libraries/shared/SpineView.svelte';
	import CardsView from '$lib/components/libraries/shared/CardsView.svelte';
	import ListView from '$lib/components/libraries/shared/ListView.svelte';
	import QuotesView from '$lib/components/libraries/shared/QuotesView.svelte';
	import type { Library } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { library }: { library: Library } = $props();
</script>

{#if library.loaded && library.entries.length === 0}
	<EmptyState title={ts.get.libraries.no_entries} description={ts.get.libraries.no_entries_desc} />
{:else if library.loaded && library.filteredEntries.length === 0}
	<EmptyState title={ts.get.libraries.no_results} description={ts.get.libraries.no_results_desc} />
{:else if library.config.type === 'quotes'}
	<QuotesView library={library as QuoteLibrary} />
{:else if library.view === 'shelf'}
	<ShelfView library={library as MusicLibrary | BookLibrary} />
{:else if library.view === 'spine'}
	<SpineView {library} />
{:else if library.view === 'cards'}
	<CardsView {library} />
{:else}
	<ListView {library} />
{/if}

<!-- h-12 w-12 aspect-square max-w-48 -->
