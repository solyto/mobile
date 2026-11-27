<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
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
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

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

	function onblur(): void {
		addTagVisible = false;
		addTagName = '';
		keyManager.unregisterAll(keyHandlers);
	}

	function findTagId(name: string): number | undefined {
		return tags.tags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id;
	}

	async function whileLoading(action: () => Promise<unknown>): Promise<void> {
		loadingIndicator.start();
		try {
			await action();
		} finally {
			loadingIndicator.stop();
		}
	}

	async function onsubmit(): Promise<void> {
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const tagName = addTagName.trim().replace('#', '');
		if (tagName === '') return;

		const tagId = findTagId(tagName);
		if (!tagId) {
			notifications.error(ts.get.todos.tag_error);
			return;
		}

		await whileLoading(() => notes.addTag(tagId));
	}

	async function onRemoveTag(tag: Tag): Promise<void> {
		await whileLoading(() => notes.removeTag(tag.id));
	}
</script>

<div class="flex flex-row gap-2">
	{#if notes.activeNote !== null}
		{#if addTagVisible}
			<div class="w-32">
				<TextInput bind:input={addTagInput} bind:value={addTagName} {onblur} />
			</div>
		{:else}
			<TagFlexList tags={notes.activeNote.tags} onRemove={onRemoveTag} />
			<button
				class="text-surface-300 hover:text-surface-700 dark:hover:text-surface-400 cursor-pointer text-xs transition-all"
				onclick={toggleAddTags}
			>
				+ {ts.get.todos.tag}
			</button>
		{/if}
	{/if}
</div>
