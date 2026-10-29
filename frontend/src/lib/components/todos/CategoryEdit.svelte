<script lang="ts">
	import type { TodoCategory } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { tick, onDestroy } from 'svelte';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();

	let { category }: { category: TodoCategory } = $props();

	let editing = $state<boolean>(false);
	let title = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers: Record<string, string | null> = { Enter: null, Escape: null };

	async function onDelete(category: TodoCategory): Promise<void> {
		loadingIndicator.start();
		await todos.deleteCategory(category);
		loadingIndicator.stop();
	}

	async function startEdit(): Promise<void> {
		keyManager.unregisterAll(keyHandlers);
		editing = true;
		title = category.title;
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', () => saveEdit(), { priority: 2 });
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', () => cancelEdit(), { priority: 2 });
		await tick();
		input?.focus();
	}

	async function saveEdit(): Promise<void> {
		if (!editing) return;
		keyManager.unregisterAll(keyHandlers);
		editing = false;
		const trimmed = title.trim();
		if (!trimmed || trimmed === category.title) return;
		loadingIndicator.start();
		await todos.updateCategory(category, { title: trimmed });
		loadingIndicator.stop();
	}

	function cancelEdit(): void {
		keyManager.unregisterAll(keyHandlers);
		editing = false;
		title = category.title;
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

<div
	class="group flex min-h-11 break-inside-avoid items-center gap-2 px-2 text-base md:mb-2 md:min-h-0 md:w-fit md:max-w-full md:gap-0 md:bg-c-neutral-1 md:py-1 md:text-sm md:dark:bg-c-neutral-7 md:dark:text-white"
	in:fade
>
	{#if editing}
		<div class="w-full py-1 md:w-48 md:py-0">
			<TextInput
				bind:input
				bind:value={title}
				onblur={saveEdit}
				placeholder={ts.get.todos.rename_category}
			/>
		</div>
	{:else}
		<span class="flex-1 truncate md:flex-none">/{category.title}</span>
		<div class="flex items-center gap-5 overflow-hidden transition-all md:gap-1 pointer-fine:w-0 pointer-fine:opacity-0 pointer-fine:group-hover:ml-2 pointer-fine:group-hover:w-9 pointer-fine:group-hover:opacity-100">
			<button
				class="flex shrink-0 cursor-pointer items-center justify-center rounded-full text-c-neutral-3 transition-all hover:text-c-heading"
				title={ts.get.todos.rename_category}
				onclick={startEdit}
			>
				<IconPen class="size-5 md:size-4" />
			</button>
			<DeleteButton onClick={() => onDelete(category)} inModal={false} buttonStyle="minimal" iconClass="size-5 md:size-4" />
		</div>
	{/if}
</div>
