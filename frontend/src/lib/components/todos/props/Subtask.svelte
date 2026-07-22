<script lang="ts">
	import { fade } from 'svelte/transition';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type { Todo, TodoSubtask } from '$lib/types/todo.js';
	import { onDestroy, tick } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const todos = getTodos();
	const ts = getTranslation();

	let { todo, subtask, handleCheckboxClick } = $props<{
		todo: Todo;
		subtask: TodoSubtask;
		handleCheckboxClick: (subtask: TodoSubtask) => void;
	}>();

	let changeTitle = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(subtask.title);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });
	let showExplanationBox = $state<boolean>(false);
	let explanationBoxX = $state<number>(0);
	let explanationBoxY = $state<number>(0);

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
		loadingIndicator.start();
		keyManager.unregisterAll(keyHandlers);
		let subtaskTitle = titleValue.trim();

		if (subtaskTitle === '') {
			return;
		}

		await todos.changeSubtaskTitle(todo, subtask, subtaskTitle);
		loadingIndicator.stop();
	}

	async function onDelete(): Promise<void> {
		loadingIndicator.start();
		await todos.deleteSubtask(todo, subtask);
		keyManager.unregisterAll(keyHandlers);
		loadingIndicator.stop();
	}

	function setExplanationBoxPosition(e: MouseEvent) {
		explanationBoxX = e.clientX;
		explanationBoxY = e.clientY;
	}
</script>

<div class="flex items-center gap-2" transition:fade>
	<Checkbox
		isChecked={subtask.is_completed}
		onchange={() => {
			handleCheckboxClick(subtask);
		}}
	/>
	{#if changeTitle}
		<TextInput bind:input={titleInput} bind:value={titleValue} {onblur} />
	{:else}
		<div
			role="button"
			tabindex="0"
			ondblclick={toggleChangeTitle}
			onmouseover={() => (showExplanationBox = true)}
			onmouseout={() => (showExplanationBox = false)}
			onfocus={() => (showExplanationBox = true)}
			onblur={() => (showExplanationBox = false)}
			onmousemove={(e) => setExplanationBoxPosition(e)}
		>
			{subtask.title}
		</div>
		<MovableHoverBox
			content={ts.get.layout.double_click_to_edit}
			show={showExplanationBox}
			x={explanationBoxX}
			y={explanationBoxY}
		/>
	{/if}
	<div class="ml-2">
		<DeleteButton inModal={false} buttonStyle="plain" onClick={onDelete} />
	</div>
</div>
