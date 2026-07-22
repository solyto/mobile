<script lang="ts">
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import { getQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import QuoteCreate from '$lib/components/libraries/quotes/QuoteCreate.svelte';
	import QuoteDetail from '$lib/components/libraries/quotes/QuoteDetail.svelte';
	import Header from '$lib/components/libraries/shared/Header.svelte';

	const library = getQuoteLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<QuoteCreate />
	{/if}
	{#if library.detailModalVisible}
		<QuoteDetail />
	{/if}
	<Entries {library} />
</div>
