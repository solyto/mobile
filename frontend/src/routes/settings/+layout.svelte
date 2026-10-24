<script lang="ts">
	import { onMount } from 'svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import { setPlugins } from '$lib/state/Plugins.svelte';
	import { getIntegrations } from '$lib/state/Integrations.svelte';

	setTags();
	setPlugins();

	const integrations = getIntegrations();

	onMount(() => {
		integrations.load();
	});

	let { children } = $props();
</script>

{@render children?.()}
