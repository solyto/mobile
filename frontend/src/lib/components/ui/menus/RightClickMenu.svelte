<script lang="ts">
	import type { RightClickMenuEntry } from '$lib/types/menu';
	import { fade } from 'svelte/transition';
	import MenuIcon from '$lib/components/ui/menus/MenuIcon.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { onMount } from 'svelte';

	let { x, y, close, entries } = $props<{
		x: number;
		y: number;
		close: () => void;
		entries: RightClickMenuEntry[];
	}>();

	let visible = $state<boolean>(false);

	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 0);
	});
</script>

{#if visible}
	<div
		class="fixed z-50 flex flex-col justify-start rounded-lg border-1 border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark-3"
		style="top: {y}px; left: {x}px;"
		transition:fade
		use:clickOutside={() => {
			close();
		}}
	>
		{#each entries as entry (entry.label)}
			<button
				class="flex cursor-pointer flex-row items-center space-x-4 px-4 py-1 text-left text-sm hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={entry.action}
			>
				<MenuIcon icon={entry.icon} size={18} />
				<span class="text-sm">{entry.label}</span>
			</button>
		{/each}
	</div>
{/if}
