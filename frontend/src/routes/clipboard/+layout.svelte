<script lang="ts">
	import { setClipboard } from '$lib/state/Clipboard.svelte';

	setClipboard();

	let { children } = $props();
</script>

{@render children?.()}
