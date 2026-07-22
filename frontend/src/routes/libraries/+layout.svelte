<script lang="ts">
	import LibraryNavigation from '$lib/components/libraries/LibraryNavigation.svelte';
	import { setLibraryNavigation } from '$lib/state/LibraryNavigation.svelte';

	setLibraryNavigation();

	let { children } = $props();
</script>

<div class="flex h-full w-full flex-row">
	<LibraryNavigation />
	{@render children?.()}
</div>
