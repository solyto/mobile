<script lang="ts">
	import IconCircleQuestionMark from '@lucide/svelte/icons/circle-question-mark';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';

	let {
		label = null,
		description,
		labelSize = 'xs',
		align = 'left',
		muted = false
	}: {
		label?: string | null;
		description: string;
		labelSize?: string;
		align?: 'left' | 'right';
		muted?: boolean;
	} = $props();

	let trigger = $state<HTMLButtonElement | null>(null);
	let hovered = $state<boolean>(false);
	let focused = $state<boolean>(false);
	let pinned = $state<boolean>(false);
	let tooltipX = $state<number>(0);
	let tooltipY = $state<number>(0);

	function isVisible(): boolean {
		return hovered || focused || pinned;
	}

	function anchorToTrigger(): void {
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		tooltipX = align === 'right' ? rect.right : rect.left;
		tooltipY = rect.bottom;
	}

	function onPointerEnter(e: PointerEvent): void {
		if (e.pointerType !== 'mouse') return;
		anchorToTrigger();
		hovered = true;
	}

	function onPointerLeave(e: PointerEvent): void {
		if (e.pointerType !== 'mouse') return;
		hovered = false;
	}

	function onFocus(): void {
		if (!trigger?.matches(':focus-visible')) return;
		anchorToTrigger();
		focused = true;
	}

	function onBlur(): void {
		focused = false;
	}

	function togglePinned(): void {
		anchorToTrigger();
		pinned = !pinned;
	}

	function unpin(): void {
		pinned = false;
	}
</script>

<button
	bind:this={trigger}
	use:clickOutside={unpin}
	type="button"
	class="flex cursor-pointer items-center gap-1 transition-all"
	class:text-c-neutral-4={muted}
	class:hover:text-inherit={muted}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
	onfocus={onFocus}
	onblur={onBlur}
	onclick={togglePinned}
>
	{#if label}
		<span class="text-{labelSize}">{label}</span>
	{/if}
	<IconCircleQuestionMark size={16} />
</button>
<MovableHoverBox
	content={description}
	show={isVisible()}
	x={tooltipX}
	y={tooltipY}
	{align}
	large={true}
	class="max-w-sm whitespace-pre-line"
/>
