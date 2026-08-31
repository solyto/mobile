<script lang="ts">
	import type { TodoCategory } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { tick, onDestroy } from 'svelte';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();

	let { category } = $props<{ category: TodoCategory }>();

	let editing = $state<boolean>(false);
	let title = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<Record<string, string | null>>({ Enter: null, Escape: null });

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
	class="lg:text-md flex cursor-pointer items-center gap-1 border-1 border-c-neutral-2 px-4 py-2 text-sm font-semibold dark:border-0 dark:border-s-dark-3 dark:bg-s-dark-2"
	in:fade
>
	{#if editing}
		<div class="w-48">
			<TextInput
				bind:input
				bind:value={title}
				onblur={saveEdit}
				placeholder={ts.get.settings.rename_category}
			/>
		</div>
	{:else}
		<span>/{category.title}</span>
		<div class="ml-2 flex items-center gap-1">
			<button
				class="z-40 flex cursor-pointer items-center justify-center rounded-full text-c-neutral-3 transition-all hover:text-c-heading"
				title={ts.get.settings.rename_category}
				onclick={startEdit}
			>
				<IconPen class="size-5" />
			</button>
			<DeleteButton onClick={() => onDelete(category)} inModal={false} buttonStyle="minimal" />
		</div>
	{/if}
</div>
