<script lang="ts">
	import type { RightClickMenuEntry } from '$lib/types/menu';
	import { fade } from 'svelte/transition';
	import MenuIcon from '$lib/components/ui/menus/MenuIcon.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { onMount } from 'svelte';

	let { x, y, close, entries }: {
		x: number;
		y: number;
		close: () => void;
		entries: RightClickMenuEntry[];
	} = $props();

	const VIEWPORT_MARGIN = 8;

	let visible = $state<boolean>(false);
	let menuWidth = $state<number>(0);
	let menuHeight = $state<number>(0);

	function left(): number {
		return Math.max(VIEWPORT_MARGIN, Math.min(x, window.innerWidth - menuWidth - VIEWPORT_MARGIN));
	}

	function top(): number {
		return Math.max(VIEWPORT_MARGIN, Math.min(y, window.innerHeight - menuHeight - VIEWPORT_MARGIN));
	}

	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 0);
	});
</script>

{#if visible}
	<div
		class="fixed z-50 flex flex-col justify-start rounded-lg border-1 border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark-3"
		style="top: {top()}px; left: {left()}px;"
		bind:offsetWidth={menuWidth}
		bind:offsetHeight={menuHeight}
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
