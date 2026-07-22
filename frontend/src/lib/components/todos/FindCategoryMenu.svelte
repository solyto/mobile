<script lang="ts">
	import { fade } from 'svelte/transition';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { onMount } from 'svelte';
	import type { TodoCategory } from '$lib/types/todo';

	let { x, y, categories, onclick, close } = $props<{
		x: number;
		y: number;
		categories: TodoCategory[];
		onclick: (id: number) => void;
		close: () => void;
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
		class="absolute z-50 flex flex-col justify-start rounded-lg border-1 border-c-neutral-2 bg-white shadow-md dark:border-s-dark dark:bg-s-dark-2"
		style="top: {y}px; left: {x}px;"
		transition:fade
		use:clickOutside={() => {
			close();
		}}
	>
		{#each categories as category (category.id)}
			<button
				class="cursor-pointer items-center px-4 py-1 text-left text-sm hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={() => {
					onclick(category.id);
					close();
				}}
			>
				<span>{category.title}</span>
			</button>
		{/each}
	</div>
{/if}
