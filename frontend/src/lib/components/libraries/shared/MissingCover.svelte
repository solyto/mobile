<script lang="ts">
	import IconMusic from '$lib/icons/lucide/eighth-notes.svelte';
	import IconBook from '$lib/icons/lucide/book.svelte';
	import IconCookingPot from '$lib/icons/lucide/cooking-pot.svelte';
	import IconClapperboard from '$lib/icons/lucide/clapperboard.svelte';
	import IconLeaf from '$lib/icons/lucide/leaf.svelte';
	import IconGamepad2 from '$lib/icons/lucide/gamepad-2.svelte';
	import type { LibraryConfig } from '$lib/types/library';

	let { library }: { library: { config: LibraryConfig } } = $props();
</script>

<div class="absolute inset-0 flex items-center justify-center rounded-sm">
	{#if library.config.type === 'recipes'}
		<IconCookingPot class="size-20 text-c-neutral-3" />
	{:else if library.config.type === 'books'}
		<IconBook class="size-20 text-c-neutral-3" />
	{:else if library.config.type === 'music'}
		<IconMusic class="size-20 text-c-neutral-3" />
	{:else if library.config.type === 'movies'}
		<IconClapperboard class="size-20 text-c-neutral-3" />
	{:else if library.config.type === 'plants'}
		<IconLeaf class="size-20 text-c-neutral-3" />
	{:else if library.config.type === 'games'}
		<IconGamepad2 class="size-20 text-c-neutral-3" />
	{/if}
</div>
