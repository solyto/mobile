<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import type { Tag } from '$lib/types/tag';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import InputAutocomplete from '$lib/components/forms/InputAutocomplete.svelte';

	const ts = getTranslation();
	const todos = getTodos();
	const tags = getTags();
	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let { todo } = $props<{
		todo: Todo;
	}>();

	let addTagVisible = $state<boolean>(false);
	let addTagInput = $state<HTMLInputElement | null>(null);
	let addTagName = $state<string>('');
	let autocompleteOpen = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleAddTags(): Promise<void> {
		addTagVisible = !addTagVisible;

		if (addTagVisible) {
			await tick();
			addTagInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}
	async function handleEnter(event: KeyboardEvent): Promise<void> {
		if (autocompleteOpen) return;
		await onsubmit();
		await toggleAddTags();
		addTagName = '';
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function onblur(): void {
		addTagVisible = false;
		addTagName = '';
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		let tagName = addTagName.trim().replace('#', '');

		if (tagName === '') {
			loadingIndicator.stop();
			return;
		}

		let tagId = tags.tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())?.id;

		if (!tagId) {
			const tag = await tags.create(tagName);

			if (!tag) {
				loadingIndicator.stop();
				notifications.error(ts.get.todos.tag_error);
				return;
			}

			tagId = tag.id;
		}

		await todos.addTag(todo, tagId);
		loadingIndicator.stop();
	}

	async function onRemoveTag(tag: Tag): Promise<void> {
		loadingIndicator.start();
		await todos.removeTag(todo, tag);
		loadingIndicator.stop();
	}
</script>

{#if addTagVisible}
	<div class="w-32 {todos.view === 'kanban' ? 'px-2 py-1 text-xs' : ''}">
		<InputAutocomplete
			bind:input={addTagInput}
			bind:value={addTagName}
			bind:open={autocompleteOpen}
			{onblur}
			items={tags.tags.map((t) => ({ label: t.name }))}
			onselect={async () => { await onsubmit(); await toggleAddTags(); addTagName = ''; }}
		/>
	</div>
{:else}
	<TagFlexList tags={todo.tags} onRemove={onRemoveTag} />
	<button
		class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
		class:ml-2={todos.view === 'list'}
		class:opacity-0={todos.view === 'list'}
		class:group-hover:opacity-100={todos.view === 'list'}
		onclick={toggleAddTags}>+ {ts.get.todos.add_tag}</button
	>
{/if}
