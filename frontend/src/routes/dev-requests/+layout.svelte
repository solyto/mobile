<script lang="ts">
	import { setDevRequests } from '$lib/state/DevRequests.svelte';

	setDevRequests();

	let { children } = $props();
</script>

{@render children?.()}
