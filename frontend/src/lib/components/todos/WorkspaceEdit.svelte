<script lang="ts">
	import type { TodoCategory, TodoWorkspace, UpdateTodoWorkspaceRequest } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { onDestroy, tick } from 'svelte';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import FindCategoryMenu from '$lib/components/todos/FindCategoryMenu.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import IconX from '@lucide/svelte/icons/x';

	const ts = getTranslation();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	// The API's limit for workspace titles (UpdateTodoWorkspaceRequest, max:50).
	const TITLE_MAX_LENGTH = 50;

	let { workspace }: { workspace: TodoWorkspace } = $props();

	let findCategoryMenuVisible = $state<boolean>(false);
	let findCategoryAnchor = $state<HTMLDivElement | null>(null);
	let deleteModalOpen = $state<boolean>(false);
	let isHideable = $state<boolean>(workspace.is_hideable);
	let editingTitle = $state<boolean>(false);
	let title = $state<string>('');
	let titleInput = $state<HTMLInputElement | null>(null);
	let keyHandlers: Record<string, string | null> = { Enter: null, Escape: null };

	// Same flow as renaming a category (CategoryEdit.svelte): Enter or blur saves, Escape cancels.
	async function startTitleEdit(): Promise<void> {
		keyManager.unregisterAll(keyHandlers);
		editingTitle = true;
		title = workspace.title;
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', () => saveTitle(), { priority: 2 });
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', () => cancelTitleEdit(), { priority: 2 });
		await tick();
		titleInput?.focus();
	}

	async function saveTitle(): Promise<void> {
		if (!editingTitle) return;
		keyManager.unregisterAll(keyHandlers);
		editingTitle = false;
		const trimmed = title.trim();
		if (!trimmed || trimmed === workspace.title) return;
		loadingIndicator.start();
		await todos.updateWorkspace(workspace, { title: trimmed });
		loadingIndicator.stop();
	}

	function cancelTitleEdit(): void {
		keyManager.unregisterAll(keyHandlers);
		editingTitle = false;
		title = workspace.title;
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function openDeleteModal(): void {
		deleteModalOpen = true;
	}

	function closeDeleteModal(): void {
		deleteModalOpen = false;
	}

	async function onDelete(): Promise<void> {
		deleteModalOpen = false;
		loadingIndicator.start();
		await todos.deleteWorkspace(workspace);
		loadingIndicator.stop();
	}

	// Only categories not in the workspace yet; the API ignores duplicates, but offering them looks like nothing happens.
	function unattachedCategories(): TodoCategory[] {
		return todos.categories.filter((category) => !workspace.categories.some((attached) => attached.id === category.id));
	}

	async function attachCategory(categoryId: number): Promise<void> {
		loadingIndicator.start();
		await todos.attachCategoryToWorkspace(workspace, categoryId);
		loadingIndicator.stop();
	}

	async function detachCategory(categoryId: number): Promise<void> {
		loadingIndicator.start();
		await todos.detachCategoryFromWorkspace(workspace, categoryId);
		loadingIndicator.stop();
	}

	function openFindCategoryMenu(): void {
		findCategoryMenuVisible = true;
	}

	function closeFindCategoryMenu(): void {
		findCategoryMenuVisible = false;
	}

	async function onToggleHideIt(): Promise<void> {
		loadingIndicator.start();
		const request: UpdateTodoWorkspaceRequest = { is_hideable: isHideable };
		await todos.updateWorkspace(workspace, request);
		loadingIndicator.stop();
	}
</script>

<div
	class="group flex flex-wrap items-center gap-3 border-b-1 border-c-neutral-1 py-3 first:pt-0 last:border-b-0 md:flex-nowrap md:items-start md:gap-6 dark:border-s-dark-2"
	in:fade
>
	<div class="flex flex-1 items-center gap-2 md:w-40 md:flex-none">
		{#if editingTitle}
			<div class="w-full">
				<TextInput
					bind:input={titleInput}
					bind:value={title}
					onblur={saveTitle}
					placeholder={ts.get.todos.rename_workspace}
					maxlength={TITLE_MAX_LENGTH}
				/>
			</div>
		{:else}
			<span class="truncate font-semibold">{workspace.title}</span>
			<div class="flex items-center gap-1 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
				<button
					class="flex shrink-0 cursor-pointer items-center justify-center rounded-full text-c-neutral-3 transition-all hover:text-c-heading"
					title={ts.get.todos.rename_workspace}
					aria-label={ts.get.todos.rename_workspace}
					onclick={startTitleEdit}
				>
					<IconPen class="size-5 md:size-4" />
				</button>
				<DeleteButton onClick={openDeleteModal} inModal={false} buttonStyle="minimal" />
			</div>
		{/if}
	</div>
	<div class="order-last flex basis-full flex-col md:order-none md:flex-1 md:basis-auto md:flex-row md:flex-wrap md:items-center md:gap-2">
		{#each workspace.categories as category (workspace.id + '-' + category.id)}
			<div class="group/chip flex items-center justify-between py-1.5 text-base md:justify-start md:bg-c-neutral-1 md:px-2 md:py-1 md:text-xs md:dark:bg-c-neutral-7 dark:text-white">
				/{category.title}
				<button
					class="ml-1 flex w-3 max-md:w-4 cursor-pointer overflow-hidden text-c-neutral-4 transition-all hover:text-c-danger pointer-fine:ml-0 pointer-fine:w-0 pointer-fine:opacity-0 pointer-fine:group-hover/chip:ml-1 pointer-fine:group-hover/chip:w-3 pointer-fine:group-hover/chip:opacity-100"
					onclick={() => detachCategory(category.id)}
				>
					<IconX class="size-3 shrink-0 max-md:size-4" />
				</button>
			</div>
		{/each}
		{#if unattachedCategories().length > 0}
			<div class="relative" bind:this={findCategoryAnchor}>
				<button
					class="cursor-pointer py-1.5 text-base text-c-neutral-4 transition-all hover:text-c-neutral-7 md:py-0 md:text-xs dark:hover:text-white"
					onclick={openFindCategoryMenu}
				>
					+ {ts.get.todos.category}
				</button>
				{#if findCategoryMenuVisible && findCategoryAnchor}
					<FindCategoryMenu
						target={findCategoryAnchor}
						categories={unattachedCategories()}
						onclick={attachCategory}
						close={closeFindCategoryMenu}
					/>
				{/if}
			</div>
		{/if}
	</div>
	<div class="md:shrink-0">
		<Toggle
			label={ts.get.todos.workspace_hide_it}
			bind:checked={isHideable}
			onchange={onToggleHideIt}
		/>
	</div>
</div>

{#if deleteModalOpen}
	<ConfirmationModal
		title={ts.get.todos.workspace_deletion_title}
		description={ts.get.todos.workspace_deletion_description}
		type="confirm-delete"
		onConfirm={onDelete}
		onCancel={closeDeleteModal}
	/>
{/if}
