<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	let { todo, mobile = false }: { todo: Todo; mobile?: boolean } = $props();

	let hovered = $state<boolean>(false);
	let hoverValue = $state<number | null>(null);
	let div = $state<HTMLDivElement | null>(null);

	const todos = getTodos(),
		loadingIndicator = getLoadingIndicator();

	function onclick(): void {
		if (hoverValue !== null) {
			onChange(hoverValue);
		}
	}

	function onmousemove(e: MouseEvent): void {
		hovered = true;
		updateFromClientX(e.clientX);
	}

	function onmouseleave(): void {
		hovered = false;
	}

	function onTouch(e: TouchEvent): void {
		if (e.touches.length > 0) {
			hovered = true;
			updateFromClientX(e.touches[0].clientX);
		}
	}

	function ontouchend(): void {
		hovered = false;
		hoverValue = null;

		if (hoverValue !== null) {
			onChange(hoverValue);
		}
	}

	async function onChange(progress: number): Promise<void> {
		loadingIndicator.start();
		await todos.changeProgress(todo, progress);
		loadingIndicator.stop();
	}

	function clampPct(v: number) {
		return Math.max(0, Math.min(100, v));
	}

	function updateFromClientX(clientX: number): void {
		const rect = div?.getBoundingClientRect();
		if (!rect) return;
		const pct = ((clientX - rect.left) / rect.width) * 100;
		hoverValue = Math.round(clampPct(pct));
	}

	function getProgress(): number {
		if (hovered && hoverValue !== null) {
			return hoverValue;
		}

		return todo.progress ?? 0;
	}
</script>

{#if mobile}
	<div class="absolute top-0 right-0 flex h-full w-1 flex-col justify-end overflow-hidden rounded-r-md">
		<div class="w-full bg-c-primary" style="height: {todo.progress ?? 0}%"></div>
	</div>
{:else}
	<div
		bind:this={div}
		class="w-full cursor-pointer py-1.5"
		{onmousemove}
		{onmouseleave}
		{onclick}
		ontouchstart={onTouch}
		ontouchmove={onTouch}
		{ontouchend}
		role="slider"
		tabindex="0"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={getProgress()}
	>
		<div class="h-1 w-full overflow-hidden rounded-full bg-c-neutral-4/25">
			<div class="h-full bg-c-primary" style="width: {getProgress()}%"></div>
		</div>
	</div>
{/if}
