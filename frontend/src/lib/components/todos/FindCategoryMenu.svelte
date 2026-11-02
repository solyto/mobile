<script lang="ts">
	import { fade } from 'svelte/transition';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { portalToBody } from '$lib/helpers/PortalHelper';
	import { onMount } from 'svelte';
	import type { TodoCategory } from '$lib/types/todo';

	let { target, categories, onclick, close }: {
		target: HTMLElement;
		categories: TodoCategory[];
		onclick: (id: number) => void;
		close: () => void;
	} = $props();

	let visible = $state<boolean>(false);

	// The menu is portalled to the top of the target, so it can grow down to the bottom of the screen
	const menuTop = target.getBoundingClientRect().top;

	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 0);
	});
</script>

{#if visible}
	<div
		class="flex flex-col justify-start overflow-y-auto overscroll-contain rounded-lg border-1 border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark max-h-[max(8rem,calc(100dvh-var(--menu-top)-1rem))] max-2xl:max-h-[max(8rem,calc(100dvh-var(--menu-top)-5rem))]"
		style="--menu-top: {menuTop}px;"
		transition:fade
		use:portalToBody={{ target, closeOnScroll: true, onClose: close }}
		use:clickOutside={() => {
			close();
		}}
	>
		{#each categories as category (category.id)}
			<button
				class="shrink-0 cursor-pointer items-center px-4 py-1 text-left text-sm hover:bg-c-neutral dark:hover:bg-s-dark-3"
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
