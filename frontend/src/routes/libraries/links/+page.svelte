<script lang="ts">
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import LinkCreate from '$lib/components/libraries/links/LinkCreate.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import CategoryHeader from '$lib/components/libraries/links/CategoryHeader.svelte';

	const library = getLinkLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	<CategoryHeader />
	{#if library.createModalVisible}
		<LinkCreate />
	{/if}
	<Entries {library} />
</div>
