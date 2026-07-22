<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import InputAutocomplete from '$lib/components/forms/InputAutocomplete.svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';

	const ts = getTranslation();
	const todos = getTodos();
	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let { todo } = $props<{
		todo: Todo;
	}>();

	let addCategoryVisible = $state<boolean>(false);
	let addCategoryInput = $state<HTMLInputElement | null>(null);
	let addCategoryTitle = $state<string>('');
	let autocompleteOpen = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

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
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);

		let categoryTitle = addCategoryTitle.trim();

		if (categoryTitle.trim().startsWith('/')) {
			categoryTitle = addCategoryTitle.slice(1);
		}

		if (categoryTitle === '') {
			loadingIndicator.stop();
			return;
		}

		let categoryId = todos.categories.find(
			(c) => c.title.toLowerCase() === categoryTitle.toLowerCase()
		)?.id;

		if (!categoryId) {
			const created = await todos.createCategory(categoryTitle);
			if (!created) {
				loadingIndicator.stop();
				notifications.error(ts.get.todos.category_error);
				return;
			}
			categoryId = created.id;
		}

		await todos.addCategory(todo, categoryId);
		loadingIndicator.stop();
	}

	async function onRemove(): Promise<void> {
		loadingIndicator.start();
		await todos.removeCategory(todo);
		loadingIndicator.stop();
	}
</script>

{#if addCategoryVisible}
	<div class="w-32 {todos.view === 'kanban' ? 'px-2 py-1 text-xs' : ''}">
		<InputAutocomplete
			bind:input={addCategoryInput}
			bind:value={addCategoryTitle}
			bind:open={autocompleteOpen}
			{onblur}
			items={todos.categories.map((c) => ({ label: c.title }))}
			onselect={async () => { await onsubmit(); await toggleAddCategories(); addCategoryTitle = ''; }}
		/>
	</div>
{:else}
	<div class="flex flex-row gap-1">
		{#if todo.category}
			<div class="group relative">
				<button
					type="button"
					class="cursor-pointer bg-c-neutral-1 px-2 py-1 text-xs font-semibold dark:bg-c-neutral-7 dark:text-white"
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
		{:else}
			<button
				class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
				class:opacity-0={todos.view === 'list'}
				class:group-hover:opacity-100={todos.view === 'list'}
				class:ml-2={todos.view === 'list'}
				onclick={toggleAddCategories}>+ {ts.get.todos.add_category}</button
			>
		{/if}
	</div>
{/if}
