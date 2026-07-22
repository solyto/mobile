<script lang="ts">
	import { fade } from 'svelte/transition';

	let { content, show, x, y } = $props<{
		content: string;
		show: boolean;
		x: number;
		y: number;
	}>();
</script>

{#if show}
	<div
		class="fixed z-30 rounded-lg border-1 border-c-neutral-1 bg-c-bg-modal p-2 text-xs shadow-lg dark:border-s-dark"
		style="top: {y + 5}px; left: {x + 5}px;"
		in:fade
	>
		{content}
	</div>
{/if}
