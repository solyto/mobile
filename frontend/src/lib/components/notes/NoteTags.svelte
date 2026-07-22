<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const notes = getNotes();
	const tags = getTags();
	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let addTagVisible = $state<boolean>(false);
	let addTagInput = $state<HTMLInputElement | null>(null);
	let addTagName = $state<string>('');
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

		const tagId = tags.tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())?.id;

		if (!tagId) {
			loadingIndicator.stop();
			notifications.error(ts.get.todos.tag_error);
			return;
		}

		await notes.addTag(tagId);
		loadingIndicator.stop();
	}

	async function onRemoveTag(tag: Tag): Promise<void> {
		loadingIndicator.start();
		await notes.removeTag(tag.id);
		loadingIndicator.stop();
	}
</script>

<div class="flex flex-row gap-2">
	{#if notes.activeNote !== null}
		{#if addTagVisible}
			<input
				type="text"
				class="dark:bg-surface-700 w-32 dark:text-white"
				{onblur}
				bind:this={addTagInput}
				bind:value={addTagName}
			/>
		{:else}
			<TagFlexList tags={notes.activeNote.tags} onRemove={onRemoveTag} />
			<button
				class="text-surface-300 hover:text-surface-700 dark:hover:text-surface-400 cursor-pointer text-xs transition-all"
				onclick={toggleAddTags}>+ {ts.get.todos.add_tag}</button
			>
		{/if}
	{/if}
</div>
