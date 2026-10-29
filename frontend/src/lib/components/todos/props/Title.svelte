<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy, tick } from 'svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();

	let { todo }: { todo: Todo } = $props();

	let changeTitle = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(todo.title);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };
	let showExplanationBox = $state<boolean>(false);
	let explanationBoxX = $state<number>(0);
	let explanationBoxY = $state<number>(0);

	async function toggleChangeTitle(): Promise<void> {
		changeTitle = !changeTitle;
		showExplanationBox = false;

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
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		let todoTitle = titleValue.trim();

		if (todoTitle === '') {
			return;
		}

		await todos.changeTitle(todo, todoTitle);
		loadingIndicator.stop();
	}

	function setExplanationBoxPosition(e: MouseEvent) {
		explanationBoxX = e.clientX;
		explanationBoxY = e.clientY;
	}
</script>

{#if changeTitle}
	<div class={todos.view === 'list' ? 'w-9/10' : 'w-3/4'}>
		<TextInput bind:input={titleInput} bind:value={titleValue} {onblur} />
	</div>
{:else}
	<span
		class="text-base font-semibold"
		role="button"
		tabindex="0"
		ondblclick={toggleChangeTitle}
		onmouseover={() => (showExplanationBox = true)}
		onmouseout={() => (showExplanationBox = false)}
		onfocus={() => (showExplanationBox = true)}
		onblur={() => (showExplanationBox = false)}
		onmousemove={(e) => setExplanationBoxPosition(e)}
	>
		{todo.title}
	</span>
	<MovableHoverBox
		content={ts.get.layout.double_click_to_edit}
		show={showExplanationBox}
		x={explanationBoxX}
		y={explanationBoxY}
	/>
{/if}
