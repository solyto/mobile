<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { onDestroy, tick } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { markdownToHtml } from '$lib/helpers/FormatHelper';
	import { nl2br } from '$lib/helpers/FormatHelper.js';
	import DOMPurify from 'dompurify';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();

	let { todo } = $props<{ todo: Todo }>();

	let changeDescription = $state<boolean>(false);
	let descriptionInput = $state<HTMLTextAreaElement | null>(null);
	let descriptionValue = $state<string>(todo.description ?? '');
	let addSubtaskVisible = $state<boolean>(false);
	let subtaskInput = $state<HTMLInputElement | null>(null);
	let subtaskValue = $state<string>('');
	let showExplanationBox = $state<boolean>(false);
	let explanationBoxX = $state<number>(0);
	let explanationBoxY = $state<number>(0);
	let keyHandlers = $state<{ [key: string]: string | null }>({
		EnterSave: null,
		EnterNewLine: null,
		EnterSubtask: null,
		EscapeSubtask: null,
		Escape: null
	});

	async function toggleChangeDescription(): Promise<void> {
		changeDescription = !changeDescription;

		if (changeDescription) {
			await tick();
			descriptionInput?.focus();

			keyHandlers.EnterSave = keyManager.registerKeyDown('Enter', handleEnter, {
				priority: 2
			});
			keyHandlers.EnterNewLine = keyManager.registerKeyDown('Enter', handleNewLineEnter, {
				withHelperKey: 'Shift'
			});
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() =>
		keyManager.unregisterKeyDowns([
			keyHandlers.EnterSave,
			keyHandlers.EnterNewLine,
			keyHandlers.Escape
		])
	);

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleChangeDescription();
	}

	function handleNewLineEnter(event: KeyboardEvent): void {
		if (descriptionInput) {
			const start = descriptionInput.selectionStart;
			const end = descriptionInput.selectionEnd;
			descriptionValue =
				descriptionValue?.slice(0, start) + '\n' + descriptionValue?.slice(end);
			descriptionInput.selectionStart = descriptionInput.selectionEnd = start + 1;
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		changeDescription = false;
		keyManager.unregisterKeyDown(keyHandlers.EnterSave);
		keyManager.unregisterKeyDown(keyHandlers.Escape);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.EnterSave);
		let todoDescription = descriptionValue.trim();

		if (todoDescription === '') {
			return;
		}

		await todos.changeDescription(todo, todoDescription);
		loadingIndicator.stop();
	}

	async function toggleAddSubtask(): Promise<void> {
		addSubtaskVisible = !addSubtaskVisible;

		if (addSubtaskVisible) {
			await tick();
			subtaskInput?.focus();
			keyHandlers.EnterSubtask = keyManager.registerKeyDown('Enter', handleSubtaskEnter, {
				priority: 2
			});
			keyHandlers.EscapeSubtask = keyManager.registerKeyDown('Escape', handleSubtaskEscape);
		}
	}

	function handleSubtaskEscape(event: KeyboardEvent): void {
		subtaskOnblur();
	}

	function subtaskOnblur(): void {
		addSubtaskVisible = false;
		keyManager.unregisterKeyDowns([keyHandlers.EnterSubtask, keyHandlers.EscapeSubtask]);
	}

	async function handleSubtaskEnter(event: KeyboardEvent): Promise<void> {
		let subtask = subtaskValue.trim();
		if (subtask !== '') {
			loadingIndicator.start();
			const res = await todos.addSubtask(todo, subtask);
			if (res) subtaskValue = '';
			loadingIndicator.stop();
		}
		await toggleAddSubtask();
	}

	function setExplanationBoxPosition(e: MouseEvent) {
		explanationBoxX = e.clientX;
		explanationBoxY = e.clientY;
	}
</script>

<div class="mt-2 w-full">
	{#if changeDescription}
		<TextInput
			bind:input={descriptionInput}
			bind:value={descriptionValue}
			multiLine={true}
			height={80}
			{onblur}
		/>
	{:else}
		<div
			role="button"
			tabindex="0"
			ondblclick={toggleChangeDescription}
			onmouseover={() => (showExplanationBox = true)}
			onmouseout={() => (showExplanationBox = false)}
			onfocus={() => (showExplanationBox = true)}
			onblur={() => (showExplanationBox = false)}
			onmousemove={(e) => setExplanationBoxPosition(e)}
		>
			{#if todo.description}
				{@html DOMPurify.sanitize(markdownToHtml(nl2br(todo.description)))}
			{:else}
				{ts.get.todos.no_description}
			{/if}
		</div>
		<MovableHoverBox
			content={ts.get.layout.double_click_to_edit}
			show={showExplanationBox}
			x={explanationBoxX}
			y={explanationBoxY}
		/>
	{/if}
</div>
