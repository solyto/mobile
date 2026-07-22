<script lang="ts">
	import type { Todo, TodoSubtask } from '$lib/types/todo';
	import { onDestroy, tick } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Subtask from '$lib/components/todos/props/Subtask.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	const ts = getTranslation();
	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let { todo, subtasks } = $props<{ todo: Todo; subtasks: TodoSubtask[] }>();

	let addSubtaskVisible = $state<boolean>(false);
	let subtaskInput = $state<HTMLInputElement | null>(null);
	let subtaskValue = $state<string>('');
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

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

<div class="mt-2 flex flex-col items-start gap-1">
	{#each subtasks as subtask (subtask.id)}
		<Subtask {todo} {subtask} {handleCheckboxClick} />
	{/each}
	{#if addSubtaskVisible}
		<div class="w-32 {todos.view === 'kanban' ? 'px-2 py-1 text-xs' : ''}">
			<TextInput bind:input={subtaskInput} bind:value={subtaskValue} {onblur} />
		</div>
	{:else}
		<button
			class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
			onclick={toggleAddSubtask}>+ {ts.get.todos.add_subtask}</button
		>
	{/if}
</div>
