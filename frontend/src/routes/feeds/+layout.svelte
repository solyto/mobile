<script lang="ts">
	import { getFeeds, setFeeds } from '$lib/state/Feeds.svelte';
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getLinkLibrary, setLinkLibrary } from '$lib/state/LinkLibrary.svelte';

	let { children } = $props();

	setFeeds();
	setLinkLibrary();

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const linkLibrary = getLinkLibrary();

	onMount(async () => {
		loadingIndicator.start();
		await feeds.load();
		loadingIndicator.stop();
		linkLibrary.load();
	});
</script>

{@render children?.()}
