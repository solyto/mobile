<script lang="ts">
	import type { Snippet } from 'svelte';

	let { wrapper = $bindable(), isOpen, isDialog, children }: {
		wrapper: HTMLElement | undefined;
		isOpen: boolean;
		isDialog: boolean;
		children: Snippet;
	} = $props();

	const GAP = 8;

	let anchor: HTMLElement | null = null;

	// In the body, so a modal's scroll container can't clip the dialog (like portalToBody).
	function toBody(node: HTMLElement): { destroy: () => void } {
		anchor = node.parentElement;
		document.body.appendChild(node);

		return {
			destroy() {
				if (node.isConnected) node.remove();
			}
		};
	}

	function place(): void {
		if (!wrapper || !anchor) return;

		const rect = anchor.getBoundingClientRect();
		const below = rect.bottom + GAP;
		const fitsBelow = below + wrapper.offsetHeight <= window.innerHeight - GAP;

		wrapper.style.top = (fitsBelow ? below : rect.top - GAP - wrapper.offsetHeight) + 'px';
		wrapper.style.left = Math.max(GAP, Math.min(rect.left, window.innerWidth - wrapper.offsetWidth - GAP)) + 'px';
	}

	$effect(() => {
		if (!isDialog || !isOpen) return;

		place();
		window.addEventListener('scroll', place, true);
		window.addEventListener('resize', place);

		return () => {
			window.removeEventListener('scroll', place, true);
			window.removeEventListener('resize', place);
		};
	});
</script>

{#if isDialog}
	<div bind:this={wrapper} use:toBody class="wrapper dialog color-picker-popup border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark-3" class:is-open={isOpen} role="dialog" aria-label="color picker">
		{@render children()}
	</div>
{:else}
	<div bind:this={wrapper} class="wrapper color-picker-popup border-c-neutral-2 bg-c-bg-modal dark:border-s-dark-3" class:is-open={isOpen} aria-label="color picker">
		{@render children()}
	</div>
{/if}

<style>
	.wrapper {
		padding: 8px;
		margin: 0 10px 10px;
		border-width: 1px;
		border-radius: 12px;
		display: none;
		width: max-content;
	}

	.is-open {
		display: inline-block;
	}

	.dialog {
		position: fixed;
		margin: 0;
		z-index: 60;
	}
</style>
