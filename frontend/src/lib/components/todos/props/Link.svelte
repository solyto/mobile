<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy, tick } from 'svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { goto } from '$app/navigation';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();

	let { todo } = $props<{ todo: Todo }>();

	let editing = $state<boolean>(false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let linkValue = $state<string>(todo.link ?? '');
	let showExplanationBox = $state<boolean>(false);
	let explanationBoxX = $state<number>(0);
	let explanationBoxY = $state<number>(0);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleEdit(): Promise<void> {
		editing = !editing;
		showExplanationBox = false;

		if (editing) {
			linkValue = todo.link ?? '';
			await tick();
			linkInput?.focus();
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleEdit();
	}

	function handleEscape(): void {
		onblur();
	}

	function onblur(): void {
		editing = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const value = linkValue.trim() || null;
		await todos.changeLink(todo, value);
		loadingIndicator.stop();
	}

	function openLink(): void {
		if (!todo.link) return;
		if (todo.link.startsWith('/')) {
			goto(todo.link);
		} else {
			window.open(todo.link, '_blank', 'noopener,noreferrer');
		}
	}

	function setExplanationBoxPosition(e: MouseEvent) {
		explanationBoxX = e.clientX;
		explanationBoxY = e.clientY;
	}
</script>

<div class="mt-2 w-full">
	{#if editing}
		<input
			type="text"
			class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:bg-s-dark-3 dark:text-white dark:focus:ring-c-primary"
			bind:this={linkInput}
			bind:value={linkValue}
			placeholder="https://..."
			{onblur}
		/>
	{:else}
		<div
			role="button"
			tabindex="0"
			ondblclick={toggleEdit}
			onmouseover={() => (showExplanationBox = true)}
			onmouseout={() => (showExplanationBox = false)}
			onfocus={() => (showExplanationBox = true)}
			onblur={() => (showExplanationBox = false)}
			onmousemove={(e) => setExplanationBoxPosition(e)}
		>
			{#if todo.link}
				<button
					type="button"
					class="max-w-full cursor-pointer truncate text-sm text-c-action underline hover:opacity-80"
					onclick={openLink}
				>
					{todo.link}
				</button>
			{:else}
				<span class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.todos.no_link}</span>
			{/if}
		</div>
		<MovableHoverBox
			content={ts.get.layout.double_click_to_edit}
			show={showExplanationBox}
			x={explanationBoxX}
			y={explanationBoxY}
		/>
	{/if}
</div>
