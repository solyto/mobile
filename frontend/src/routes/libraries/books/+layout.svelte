<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getBookLibrary, setBookLibrary } from '$lib/state/BookLibrary.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';

	setBookLibrary();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const library = getBookLibrary();
	const tags = getTags();

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([library.load(), tags.load()]);
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
