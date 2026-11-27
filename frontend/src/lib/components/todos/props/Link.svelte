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
	import IconExternalLink from '$lib/icons/lucide/external-link.svelte';
	import { safeHref } from '$lib/helpers/UrlHelper';
	import { HoverExplanation } from '$lib/helpers/HoverExplanation.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let { todo }: { todo: Todo } = $props();

	let editing = $state<boolean>(false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let linkValue = $state<string>(todo.link ?? '');
	const explanation = new HoverExplanation();
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };
	let href = $derived(safeHref(todo.link));

	async function toggleEdit(): Promise<void> {
		editing = !editing;
		explanation.hide();

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
		try {
			await todos.changeLink(todo, linkValue.trim() || null);
		} finally {
			loadingIndicator.stop();
		}
	}

	function editOnTap(): void {
		if (viewPoint.isMobile) toggleEdit();
	}

	function openLink(): void {
		if (!href) return;
		if (href.startsWith('/')) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- user-entered path, not a known route
			goto(href);
		} else {
			window.open(href, '_blank', 'noopener,noreferrer');
		}
	}

	function openLinkWithoutEditing(event: MouseEvent): void {
		event.stopPropagation();
		openLink();
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
			onclick={editOnTap}
			{...explanation.handlers}
		>
			{#if todo.link && !href}
				<span class="block max-w-full truncate text-sm">{todo.link}</span>
			{:else if todo.link && viewPoint.isMobile}
				<div class="flex items-center gap-2">
					<span class="min-w-0 truncate text-sm text-c-action underline">{todo.link}</span>
					<button
						type="button"
						class="shrink-0 cursor-pointer text-c-action hover:opacity-80"
						aria-label={ts.get.todos.open_link}
						title={ts.get.todos.open_link}
						onclick={openLinkWithoutEditing}
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
			show={explanation.visible}
			x={explanation.x}
			y={explanation.y}
		/>
	{/if}
</div>
