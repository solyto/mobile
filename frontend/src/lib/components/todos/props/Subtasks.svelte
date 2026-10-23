<script lang="ts">
	import type { Todo, TodoSubtask } from '$lib/types/todo';
	import { onDestroy, tick } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Subtask from '$lib/components/todos/props/Subtask.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	const ts = getTranslation();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let { todo, subtasks, fullWidth = false }: {
		todo: Todo;
		subtasks: TodoSubtask[];
		fullWidth?: boolean;
	} = $props();

	let addSubtaskVisible = $state<boolean>(false);
	let subtaskInput = $state<HTMLInputElement | null>(null);
	let subtaskValue = $state<string>('');
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleAddSubtask(): Promise<void> {
		addSubtaskVisible = !addSubtaskVisible;

		if (addSubtaskVisible) {
			await tick();
			subtaskInput?.focus();
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 2 });
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		addSubtaskVisible = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		let subtask = subtaskValue.trim();
		if (subtask !== '') {
			loadingIndicator.start();
			const res = await todos.addSubtask(todo, subtask);
			if (res) subtaskValue = '';
			loadingIndicator.stop();
			keyManager.unregisterAll(keyHandlers);
		}
		await toggleAddSubtask();
	}

	async function handleCheckboxClick(subtask: TodoSubtask): Promise<void> {
		const is_completed = !subtask.is_completed;
		loadingIndicator.start();
		await todos.markSubtask(todo, subtask, is_completed);
		loadingIndicator.stop();
	}
</script>

<div class="mt-2 flex flex-col gap-1" class:items-start={!fullWidth} class:w-full={fullWidth}>
	{#each subtasks as subtask (subtask.id)}
		<Subtask {todo} {subtask} {handleCheckboxClick} />
	{/each}
	{#if addSubtaskVisible}
		<div class="w-full {todos.view === 'kanban' ? 'px-2 py-1 text-xs' : ''}" class:mt-2={subtasks.length > 0}>
			<TextInput bind:input={subtaskInput} bind:value={subtaskValue} {onblur} />
		</div>
	{:else}
		<button
			class="cursor-pointer text-left text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
			class:mt-2={subtasks.length > 0}
			onclick={toggleAddSubtask}>+ {ts.get.todos.add_subtask}</button
		>
	{/if}
</div>
