<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getPlantLibrary, setPlantLibrary } from '$lib/state/PlantLibrary.svelte';

	setPlantLibrary();

	const loadingIndicator = getLoadingIndicator();
	const library = getPlantLibrary();

	onMount(async () => {
		loadingIndicator.start();
		try {
			await library.load();
		} finally {
			loadingIndicator.stop();
		}
	});

	let { children } = $props();
</script>

{@render children?.()}
