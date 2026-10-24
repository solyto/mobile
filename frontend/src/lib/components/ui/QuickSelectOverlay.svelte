<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { fade, scale } from 'svelte/transition';
	import { portalToBody } from '$lib/helpers/PortalHelper';

	let {
		onClose,
		children,
		class: className = '',
		p = null,
		portal = false,
		target = null
	}: {
		onClose: () => void;
		children?: Snippet;
		class?: string;
		p?: number | null;
		portal?: boolean;
		target?: HTMLElement | null;
	} = $props();
</script>

{#if portal}
	<div
		use:clickOutside={onClose}
		use:portalToBody={{ target, closeOnScroll: true, onClose }}
		in:scale|global={{ start: 0.9, duration: 150 }}
		out:fade={{ duration: 200 }}
		class="flex flex-col gap-2 rounded-lg border-1 border-c-neutral-2 bg-c-bg-modal p-4 drop-shadow-lg {className}"
	>
		{@render children?.()}
	</div>
{:else}
	<div
		use:clickOutside={onClose}
		in:scale|global={{ start: 0.9, duration: 150 }}
		out:fade={{ duration: 200 }}
		class="absolute top-0 z-50 flex flex-col gap-2 rounded-lg bg-c-bg-modal {p !== null ? 'p-' + p : 'p-4'} drop-shadow-lg {className}"
	>
		{@render children?.()}
	</div>
{/if}