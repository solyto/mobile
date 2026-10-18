<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import AcceptButton from '$lib/components/ui/buttons/AcceptButton.svelte';
	import ModalTitle from '$lib/components/ui/ModalTitle.svelte';
	import { SHEET_RELEASE_PAUSE, SHEET_TAP_TOLERANCE, getSheetDragOffset, shouldCloseSheet } from '$lib/helpers/BottomSheetHelper';

	const viewPoint = getViewPoint();

	let {
		onClose,
		onDelete,
		onComplete,
		onRename,
		children,
		title = null
	}: {
		onClose?: () => void | Promise<void>;
		onDelete?: () => void | Promise<void>;
		onComplete?: (event?: MouseEvent) => void | Promise<void>;
		onRename?: (title: string) => Promise<boolean>;
		children?: Snippet;
		title?: string | null;
	} = $props();

	let sheet = $state<HTMLDivElement | null>(null);
	let dragOffset = $state(0);
	let dragging = $state(false);
	let dragMoved = false;
	let dragStartY = 0;
	let lastY = 0;
	let lastTime = 0;
	let velocity = 0;

	function onDragStart(event: PointerEvent): void {
		if (!onClose) return;
		dragging = true;
		dragMoved = false;
		dragStartY = lastY = event.clientY;
		lastTime = event.timeStamp;
		velocity = 0;
	}

	function onDragMove(event: PointerEvent): void {
		if (!dragging) return;
		const offset = getSheetDragOffset(dragStartY, event.clientY);

		if (!dragMoved && offset > SHEET_TAP_TOLERANCE) {
			dragMoved = true;
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		}

		if (event.timeStamp > lastTime) velocity = (event.clientY - lastY) / (event.timeStamp - lastTime);
		lastY = event.clientY;
		lastTime = event.timeStamp;
		if (dragMoved) dragOffset = offset;
	}

	function onDragEnd(event: PointerEvent): void {
		if (!dragging) return;
		dragging = false;
		if (event.timeStamp - lastTime > SHEET_RELEASE_PAUSE) velocity = 0;

		if (dragMoved && shouldCloseSheet(dragOffset, sheet?.offsetHeight ?? 0, velocity)) {
			onClose?.();
			return;
		}
		dragOffset = 0;
	}

	function onBackdropClick(): void {
		if (!dragMoved) onClose?.();
	}

	const dragHandlers = {
		onpointerdown: onDragStart,
		onpointermove: onDragMove,
		onpointerup: onDragEnd,
		onpointercancel: onDragEnd
	};
</script>

<div
	class="fixed top-0 left-0 z-40 flex h-dvh w-screen items-end bg-transparent backdrop-blur-xs modal-blur pb-16 2xl:pb-0"
	style:padding-bottom={viewPoint.keyboardHeight ? `${viewPoint.keyboardHeight}px` : ''}
	in:fly|global={{ y: 400, duration: 350 }}
	out:fly|global={{ y: 400, duration: 250 }}
>
	{#if onClose}
		<div class="absolute inset-0 touch-none" role="presentation" onclick={onBackdropClick} {...dragHandlers}></div>
	{/if}
	<div
		class="relative w-full"
		class:transition-transform={!dragging}
		class:duration-200={!dragging}
		style:transform={dragOffset ? `translateY(${dragOffset}px)` : ''}
		bind:this={sheet}
	>
		{#if onClose}
			<CloseButton onClick={onClose} />
		{/if}
		{#if onComplete}
			<div class="absolute top-20 right-4 z-40">
				<AcceptButton onClick={onComplete} />
			</div>
		{/if}
		{#if onDelete}
			<div class="absolute top-32 right-4 z-40">
				<DeleteButton onClick={onDelete} inModal={false} />
			</div>
		{/if}
		<div class="relative z-30 flex w-full flex-col rounded-t-2xl bg-c-bg-modal shadow-md not-dark:border-t-1 not-dark:border-c-neutral-2 dark:shadow-s-dark-shadow max-h-[calc(100dvh-4rem)]">
			<div class="shrink-0 touch-none px-6 pt-3" class:pb-4={title} class:pb-3={!title} {...dragHandlers}>
				{#if onClose}
					<div class="mx-auto mb-3 h-1 w-10 rounded-full bg-c-neutral-3 dark:bg-s-dark-3"></div>
				{/if}
				{#if title}
					<div class="text-xl font-bold text-c-heading dark:text-c-primary">
						<ModalTitle {title} {onRename} />
					</div>
				{/if}
			</div>
			<div class="min-h-0 overflow-y-auto px-6 pb-6">
				{@render children?.()}
			</div>
		</div>
	</div>
</div>
