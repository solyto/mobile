<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		root = $bindable<HTMLDivElement | null>(null),
		class: customClass,
		position = 'fixed',
		children
	}: {
		root: HTMLDivElement | null;
		class: string;
		// Must match how the popover gets placed, or its first placement measures from the wrong origin.
		position?: 'fixed' | 'absolute';
		children: Snippet;
	} = $props();
</script>

<div bind:this={root} style:position={position} style="top:-9999px;left:-9999px">
	<div class="rounded-lg border border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark {customClass}">
		{@render children()}
	</div>
</div>
