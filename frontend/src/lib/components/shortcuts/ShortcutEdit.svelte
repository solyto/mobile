<script lang="ts">
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import type { Shortcut, UpdateShortcutRequest } from '$lib/types/shortcut.js';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getShortcuts } from '$lib/state/Shortcuts.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy, tick } from 'svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const shortcuts = getShortcuts();
	const keyManager = getKeyManager();

	let { shortcut } = $props<{ shortcut: Shortcut }>();

	let edit = $state<boolean>(false);
	let titleValue = $state<string>(shortcut.title);
	let urlValue = $state<string>(shortcut.url);
	let titleInput = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ Enter: string | null; Escape: string | null }>({ Enter: null, Escape: null });

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleEdit() {
		edit = !edit;
		if (edit) {
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', onUpdate);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', toggleEdit);
			await tick();
			titleInput?.focus();
		} else {
			keyManager.unregisterAll(keyHandlers);
			keyHandlers = { Enter: null, Escape: null };
		}
	}

	async function onUpdate() {
		loadingIndicator.start();
		const request: UpdateShortcutRequest = {
			title: titleValue != '' ? titleValue : shortcut.title,
			url: urlValue != '' ? urlValue : shortcut.url
		};
		await shortcuts.update(shortcut, request);
		loadingIndicator.stop();
		toggleEdit();
	}

	async function onDelete(shortcut: Shortcut): Promise<void> {
		loadingIndicator.start();
		await shortcuts.delete(shortcut);
		loadingIndicator.stop();
	}
</script>

<div
	class="flex w-full flex-col items-center gap-4 rounded-lg px-1 py-2 text-lg font-bold"
>
	{#if !edit}
		<div class="flex w-full items-center justify-between gap-2">
			<span>{shortcut.title}</span>
			<div class="flex items-center gap-2">
				<InlineEditButton onClick={() => toggleEdit()} />
				<InlineDeleteButton
					onClick={() => {
						onDelete(shortcut);
					}}
				/>
			</div>
		</div>
	{:else}
		<div class="flex items-center gap-2">
			<TextInput bind:input={titleInput} bind:value={titleValue} placeholder={ts.get.widgets.shortcut_title} />
			<TextInput bind:value={urlValue} placeholder={ts.get.widgets.shortcut_url} />
			<SaveButton
				onClick={() => {
					onUpdate();
				}}
			/>
		</div>
	{/if}
</div>
