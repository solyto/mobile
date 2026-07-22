<script lang="ts">
	import IconMusic from '@lucide/svelte/icons/music';
	import IconBook from '@lucide/svelte/icons/book';
	import IconCookingPot from '@lucide/svelte/icons/cooking-pot';
	import IconClapperboard from '@lucide/svelte/icons/clapperboard';
	import IconLeaf from '@lucide/svelte/icons/leaf';
	import type { Library } from '$lib/types/library';

	let { library } = $props<{ library: Library }>();
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
	{/if}
</div>
