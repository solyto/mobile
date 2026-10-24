<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getLinkLibrary, setLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';

	setLinkLibrary();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const library = getLinkLibrary();
	const tags = getTags();

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([library.load(), tags.load()]);
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
