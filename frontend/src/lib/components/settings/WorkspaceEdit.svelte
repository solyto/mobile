<script lang="ts">
	import type { TodoWorkspace, UpdateTodoWorkspaceRequest } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import FindCategoryMenu from '$lib/components/todos/FindCategoryMenu.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	const ts = getTranslation();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let { workspace } = $props<{ workspace: TodoWorkspace }>();

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

	async function onToggleHideIt(): Promise<void> {
		loadingIndicator.start();
		const request: UpdateTodoWorkspaceRequest = { is_hideable: isHideable };
		await todos.updateWorkspace(workspace, request);
		loadingIndicator.stop();
	}
</script>

<div class="relative flex flex-col max-md:w-full">
	{#if findCategoryMenuVisible}
		<FindCategoryMenu
			x={0}
			y={0}
			categories={todos.categories}
			onclick={(id: number) => {
				attachCategory(id);
			}}
			close={() => {
				findCategoryMenuVisible = false;
			}}
		/>
	{/if}
	<div class="rounded-lg border-1 border-c-neutral-1 p-2 shadow-sm dark:border-0 dark:bg-s-dark-2">
		<div class="flex items-center justify-between gap-2 px-4 py-2" in:fade>
			<span class="font-bold">{workspace.title}</span>
			<div class="mr-[-7px] flex items-center gap-1">
				<DeleteButton onClick={() => onDelete(workspace)} inModal={false} buttonStyle="plain" />
			</div>
		</div>
		<div class="flex flex-col gap-2 px-4 py-2">
			{#each workspace.categories as category (workspace.id + '-' + category.id)}
				<div class="flex w-full items-center justify-between gap-1">
					<span class="text-sm">- /{category.title}</span>
					<div class="mr-[-7px] flex items-center gap-1">
						<DeleteButton
							onClick={() => detachCategory(category.id)}
							inModal={false}
							buttonStyle="minimal"
						/>
					</div>
				</div>
			{/each}
			<div class="text-sm">
				<TextButton
					title="+ {ts.get.todos.add_category}"
					onclick={() => {
						findCategoryMenuVisible = true;
					}}
					type="plain"
					class="mt-4"
				/>
			</div>
			<div class="mt-4">
				<Toggle
					label={ts.get.todos.workspace_hide_it_description}
					bind:checked={isHideable}
					onchange={() => onToggleHideIt()}
				/>
			</div>
		</div>
	</div>
</div>
