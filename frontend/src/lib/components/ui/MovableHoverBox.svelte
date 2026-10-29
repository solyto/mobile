<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		content,
		show,
		x,
		y,
		align = 'left',
		large = false,
		class: customClass = ''
	}: {
		content: string;
		show: boolean;
		x: number;
		y: number;
		align?: 'left' | 'right';
		large?: boolean;
		class?: string;
	} = $props();

	function horizontalPosition(): string {
		return align === 'right' ? `right: ${window.innerWidth - x + 5}px;` : `left: ${x + 5}px;`;
	}
</script>

{#if show}
	<div
		class="fixed z-30 rounded-lg border-1 border-c-neutral-1 bg-c-bg-modal shadow-lg dark:border-s-dark {customClass}"
		class:p-2={!large}
		class:text-xs={!large}
		class:p-4={large}
		class:text-sm={large}
		style="top: {y + 5}px; {horizontalPosition()}"
		in:fade
	>
		{content}
	</div>
{/if}
