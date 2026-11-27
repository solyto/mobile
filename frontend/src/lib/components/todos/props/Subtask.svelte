<script lang="ts">
	import { fade } from 'svelte/transition';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type { Todo, TodoSubtask } from '$lib/types/todo.js';
	import { onDestroy, tick } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { HoverExplanation } from '$lib/helpers/HoverExplanation.svelte';

	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const todos = getTodos();
	const ts = getTranslation();

	let { todo, subtask, handleCheckboxClick }: {
		todo: Todo;
		subtask: TodoSubtask;
		handleCheckboxClick: (subtask: TodoSubtask) => void;
	} = $props();

	let changeTitle = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(subtask.title);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };
	const explanation = new HoverExplanation();

	async function toggleChangeTitle(): Promise<void> {
		changeTitle = !changeTitle;

		if (changeTitle) {
			await tick();
			titleInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleChangeTitle();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		changeTitle = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		keyManager.unregisterAll(keyHandlers);
		const subtaskTitle = titleValue.trim();
		if (subtaskTitle === '') return;

		loadingIndicator.start();
		try {
			await todos.changeSubtaskTitle(todo, subtask, subtaskTitle);
		} finally {
			loadingIndicator.stop();
		}
	}

	async function onDelete(): Promise<void> {
		loadingIndicator.start();
		try {
			await todos.deleteSubtask(todo, subtask);
			keyManager.unregisterAll(keyHandlers);
		} finally {
			loadingIndicator.stop();
		}
	}

	function toggleCompleted(event: Event): void {
		handleCheckboxClick(subtask);
	}
</script>

<div class="flex items-center gap-2" transition:fade>
	<Checkbox isChecked={subtask.is_completed} onchange={toggleCompleted} />
	<div class="min-w-0 flex-1">
		{#if changeTitle}
			<TextInput bind:input={titleInput} bind:value={titleValue} {onblur} />
		{:else}
			<div
				role="button"
				tabindex="0"
				ondblclick={toggleChangeTitle}
				{...explanation.handlers}
			>
				{subtask.title}
			</div>
			<MovableHoverBox
				content={ts.get.layout.double_click_to_edit}
				show={explanation.visible}
				x={explanation.x}
				y={explanation.y}
			/>
		{/if}
	</div>
	<div class="shrink-0">
		<DeleteButton inModal={false} buttonStyle="plain" onClick={onDelete} />
	</div>
</div>
