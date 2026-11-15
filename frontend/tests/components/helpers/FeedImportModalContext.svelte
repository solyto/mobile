<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setFeeds } from '$lib/state/Feeds.svelte';
	import { setFeedImport } from '$lib/state/FeedImport.svelte';
	import FeedImportModal from '$lib/components/feeds/FeedImportModal.svelte';

	setFeeds();
	const feedImport = setFeedImport();
	feedImport.modalOpen = true;

	onDestroy(() => feedImport.destroy());
</script>

{#if feedImport.modalOpen}
	<FeedImportModal />
{/if}
