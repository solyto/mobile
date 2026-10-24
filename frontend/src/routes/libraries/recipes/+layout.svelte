<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import { getRecipeLibrary, setRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';

	setRecipeLibrary();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const library = getRecipeLibrary();

	onMount(async () => {
		loadingIndicator.start();
		await library.load();
		loadingIndicator.stop();
	});

	let { children } = $props();
</script>

{@render children?.()}
