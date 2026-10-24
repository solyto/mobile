<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getPlantLibrary, setPlantLibrary } from '$lib/state/PlantLibrary.svelte';

	setPlantLibrary();

	const loadingIndicator = getLoadingIndicator();
	const library = getPlantLibrary();

	onMount(async () => {
		loadingIndicator.start();
		await library.load();
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
