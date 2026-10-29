<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';
	import { getIntegrations } from '$lib/state/Integrations.svelte';
	import { getGameLibrary, setGameLibrary } from '$lib/state/GameLibrary.svelte';

	setGameLibrary();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const library = getGameLibrary();
	const tags = getTags();
	const integrations = getIntegrations();

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([library.load(), tags.load(), integrations.load()]);
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
