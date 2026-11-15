<script lang="ts">
	import { getFeeds, setFeeds } from '$lib/state/Feeds.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getLinkLibrary, setLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getFeedImport, setFeedImport } from '$lib/state/FeedImport.svelte';

	let { children } = $props();

	setFeeds();
	setFeedImport();
	setLinkLibrary();

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const linkLibrary = getLinkLibrary();
	const feedImport = getFeedImport();

	onMount(async () => {
		loadingIndicator.start();
		await feeds.load();
		loadingIndicator.stop();
		linkLibrary.load();
		feedImport.resume();
	});

	onDestroy(() => feedImport.destroy());
</script>

{@render children?.()}
