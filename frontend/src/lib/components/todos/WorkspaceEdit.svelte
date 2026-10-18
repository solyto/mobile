<script lang="ts">
	import type { TodoWorkspace, UpdateTodoWorkspaceRequest } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import FindCategoryMenu from '$lib/components/todos/FindCategoryMenu.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import IconX from '@lucide/svelte/icons/x';

	const ts = getTranslation();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let { workspace }: { workspace: TodoWorkspace } = $props();

	let findCategoryMenuVisible = $state<boolean>(false);
	let isHideable = $state<boolean>(workspace.is_hideable);

	async function onDelete(workspace: TodoWorkspace): Promise<void> {
		loadingIndicator.start();
		await todos.deleteWorkspace(workspace);
		loadingIndicator.stop();
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
		<span class="truncate font-semibold">{workspace.title}</span>
		<div class="pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
			<DeleteButton onClick={() => onDelete(workspace)} inModal={false} buttonStyle="minimal" />
		</div>
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
		<div class="relative">
			<button
				class="cursor-pointer py-1.5 text-base text-c-neutral-4 transition-all hover:text-c-neutral-7 md:py-0 md:text-xs dark:hover:text-white"
				onclick={openFindCategoryMenu}
			>
				+ {ts.get.todos.category}
			</button>
			{#if findCategoryMenuVisible}
				<FindCategoryMenu
					x={0}
					y={0}
					categories={todos.categories}
					onclick={attachCategory}
					close={closeFindCategoryMenu}
				/>
			{/if}
		</div>
	</div>
	<div class="md:shrink-0">
		<Toggle
			label={ts.get.todos.workspace_hide_it}
			bind:checked={isHideable}
			onchange={onToggleHideIt}
		/>
	</div>
</div>
