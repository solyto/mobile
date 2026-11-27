<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { onDestroy, tick } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { markdownToHtml } from '$lib/helpers/MarkdownHelper';
	import { nl2br } from '$lib/helpers/FormatHelper.js';
	import DOMPurify from 'dompurify';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { HoverExplanation } from '$lib/helpers/HoverExplanation.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let { todo }: { todo: Todo } = $props();

	let changeDescription = $state<boolean>(false);
	let descriptionInput = $state<HTMLTextAreaElement | null>(null);
	let descriptionValue = $state<string>(todo.description ?? '');
	const explanation = new HoverExplanation();
	let keyHandlers: { [key: string]: string | null } = {
		EnterSave: null,
		EnterNewLine: null,
		Escape: null
	};

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
		keyManager.unregisterKeyDown(keyHandlers.EnterSave);
		const todoDescription = descriptionValue.trim();
		if (todoDescription === '') return;

		loadingIndicator.start();
		try {
			await todos.changeDescription(todo, todoDescription);
		} finally {
			loadingIndicator.stop();
		}
	}

	function editOnTap(): void {
		if (viewPoint.isMobile) toggleChangeDescription();
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
			onclick={editOnTap}
			{...explanation.handlers}
		>
			{#if todo.description}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised with DOMPurify -->
				{@html DOMPurify.sanitize(markdownToHtml(nl2br(todo.description)))}
			{:else}
				{ts.get.todos.no_description}
			{/if}
		</div>
		<MovableHoverBox
			content={ts.get.layout.double_click_to_edit}
			show={explanation.visible}
			x={explanation.x}
			y={explanation.y}
		/>
	{/if}
</div>
