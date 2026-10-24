<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy, tick } from 'svelte';
	import MovableHoverBox from '$lib/components/ui/MovableHoverBox.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { goto } from '$app/navigation';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import IconExternalLink from '@lucide/svelte/icons/external-link';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let { todo }: { todo: Todo } = $props();

	let editing = $state<boolean>(false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let linkValue = $state<string>(todo.link ?? '');
	let showExplanationBox = $state<boolean>(false);
	let explanationBoxX = $state<number>(0);
	let explanationBoxY = $state<number>(0);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	async function toggleEdit(): Promise<void> {
		editing = !editing;
		showExplanationBox = false;

		if (editing) {
			linkValue = todo.link ?? '';
			await tick();
			linkInput?.focus();
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleEdit();
	}

	function handleEscape(): void {
		onblur();
	}

	function onblur(): void {
		editing = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const value = linkValue.trim() || null;
		await todos.changeLink(todo, value);
		loadingIndicator.stop();
	}

	function openLink(): void {
		if (!todo.link) return;
		if (todo.link.startsWith('/')) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- user-entered path, not a known route
			goto(todo.link);
		} else {
			window.open(todo.link, '_blank', 'noopener,noreferrer');
		}
	}

	function setExplanationBoxPosition(e: MouseEvent) {
		explanationBoxX = e.clientX;
		explanationBoxY = e.clientY;
	}
</script>

<div class="mt-2 w-full">
	{#if editing}
		<TextInput bind:input={linkInput} bind:value={linkValue} placeholder="https://..." {onblur} />
	{:else}
		<div
			role="button"
			tabindex="0"
			ondblclick={toggleEdit}
			onclick={() => viewPoint.isMobile && toggleEdit()}
			onmouseover={() => (showExplanationBox = true)}
			onmouseout={() => (showExplanationBox = false)}
			onfocus={() => (showExplanationBox = true)}
			onblur={() => (showExplanationBox = false)}
			onmousemove={(e) => setExplanationBoxPosition(e)}
		>
			{#if todo.link && viewPoint.isMobile}
				<div class="flex items-center gap-2">
					<span class="min-w-0 truncate text-sm text-c-action underline">{todo.link}</span>
					<button
						type="button"
						class="shrink-0 cursor-pointer text-c-action hover:opacity-80"
						aria-label={ts.get.todos.open_link}
						title={ts.get.todos.open_link}
						onclick={(e) => {
							e.stopPropagation();
							openLink();
						}}
					>
						<IconExternalLink class="size-4" />
					</button>
				</div>
			{:else if todo.link}
				<button
					type="button"
					class="max-w-full cursor-pointer truncate text-sm text-c-action underline hover:opacity-80"
					onclick={openLink}
				>
					{todo.link}
				</button>
			{:else}
				<span class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.todos.no_link}</span>
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
