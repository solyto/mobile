<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getQuoteLibrary, setQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';

	setQuoteLibrary();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const library = getQuoteLibrary();
	const tags = getTags();

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([library.load(), tags.load()]);
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
