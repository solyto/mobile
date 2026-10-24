<script lang="ts">
	import { setFriends } from '$lib/state/Friends.svelte';

	setFriends();

	let { children } = $props();
</script>

{@render children?.()}
