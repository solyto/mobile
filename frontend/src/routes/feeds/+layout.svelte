<script lang="ts">
	import { getFeeds, setFeeds } from '$lib/state/Feeds.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFeedImport, setFeedImport } from '$lib/state/FeedImport.svelte';

	let { children } = $props();

	setFeeds();
	setFeedImport();

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const feedImport = getFeedImport();

	onMount(async () => {
		loadingIndicator.start();
		await feeds.load();
		loadingIndicator.stop();
		feedImport.resume();
	});

	onDestroy(() => feedImport.destroy());
</script>

{@render children?.()}
