<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import InputAutocomplete from '$lib/components/forms/InputAutocomplete.svelte';
	import IconTrash from '$lib/icons/lucide/trash.svelte';

	const ts = getTranslation();
	const todos = getTodos();
	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let { todo, readonly = false, hoverReveal = false }: {
		todo: Todo;
		readonly?: boolean;
		hoverReveal?: boolean;
	} = $props();

	let addCategoryVisible = $state<boolean>(false);
	let addCategoryInput = $state<HTMLInputElement | null>(null);
	let addCategoryTitle = $state<string>('');
	let autocompleteOpen = $state<boolean>(false);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	async function toggleAddCategories(): Promise<void> {
		addCategoryVisible = !addCategoryVisible;

		if (addCategoryVisible) {
			await tick();
			addCategoryInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		if (autocompleteOpen) return;
		await submitAndClose();
	}

	async function submitAndClose(): Promise<void> {
		await onsubmit();
		await toggleAddCategories();
		addCategoryTitle = '';
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		addCategoryVisible = false;
		addCategoryTitle = '';
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const trimmed = addCategoryTitle.trim();
		const categoryTitle = trimmed.startsWith('/') ? addCategoryTitle.slice(1) : trimmed;
		if (categoryTitle === '') return;

		loadingIndicator.start();
		try {
			await assignCategory(categoryTitle);
		} finally {
			loadingIndicator.stop();
		}
	}

	async function assignCategory(title: string): Promise<void> {
		const existing = todos.categories.find((c) => c.title.toLowerCase() === title.toLowerCase());
		const category = existing ?? (await todos.createCategory(title));
		if (!category) {
			notifications.error(ts.get.todos.category_error);
			return;
		}
		await todos.addCategory(todo, category.id);
	}

	async function onRemove(): Promise<void> {
		loadingIndicator.start();
		try {
			await todos.removeCategory(todo);
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

{#if addCategoryVisible && !readonly}
	<div class="w-32" class:px-2={todos.view === 'kanban'} class:py-1={todos.view === 'kanban'} class:text-xs={todos.view === 'kanban'}>
		<InputAutocomplete
			bind:input={addCategoryInput}
			bind:value={addCategoryTitle}
			bind:open={autocompleteOpen}
			{onblur}
			items={todos.categories.map((c) => ({ label: c.title }))}
			onselect={submitAndClose}
		/>
	</div>
{:else}
	<div class="flex flex-row gap-1">
		{#if todo.category}
			{#if readonly}
				<div class="bg-c-neutral-1 px-2 py-1 text-xs dark:bg-c-neutral-7 dark:text-white">
					/{todo.category.title}
				</div>
			{:else}
				<div class="group relative">
					<button
						type="button"
						class="cursor-pointer bg-c-neutral-1 px-2 py-1 text-xs dark:bg-c-neutral-7 dark:text-white"
						onclick={toggleAddCategories}
					>
						/{todo.category.title}
					</button>
					<button
						class="absolute top-[-14px] right-[-14px] z-40 hidden size-[20px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all group-hover:flex hover:text-c-heading hover:drop-shadow-xl"
						onclick={onRemove}
					>
						<IconTrash class="size-3" />
					</button>
				</div>
			{/if}
		{:else if !readonly}
			<button
				class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
				class:opacity-0={hoverReveal}
				class:group-hover:opacity-100={hoverReveal}
				class:ml-2={hoverReveal}
				onclick={toggleAddCategories}>+ {ts.get.todos.category}</button
			>
		{/if}
	</div>
{/if}
