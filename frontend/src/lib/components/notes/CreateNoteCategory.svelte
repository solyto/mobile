<script lang="ts">
	import IconFolderPlus from '@lucide/svelte/icons/folder-plus';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const keyManager = getKeyManager();
	const notes = getNotes();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let formOpen = $state<boolean>(false);
	let userInput = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleForm(): Promise<void> {
		formOpen = !formOpen;
		if (formOpen) {
			await tick();
			input?.focus();
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 3 });
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	function onblur(): void {
		formOpen = false;
		keyManager.unregisterAll(keyHandlers);
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		if (!formOpen) {
			await toggleForm();
			return;
		}

		loadingIndicator.start();

		if (userInput.trim() !== '') {
			notes.inputValue = userInput;
			const res = await notes.createCategory();

			if (res) {
				userInput = '';
				notifications.success(ts.get.notes.create_folder_success);
			}
		}

		await toggleForm();
		loadingIndicator.stop();
		keyManager.unregisterAll(keyHandlers);
	}
</script>

{#if formOpen}
	<input
		bind:this={input}
		bind:value={userInput}
		{onblur}
		type="text"
		class="border-primary-300 focus:border-primary-500 w-full border-0 border-b-2 focus:outline-none dark:bg-s-dark-3 dark:text-white"
		placeholder="Enter folder title"
	/>
{:else}
	<button
		class="flex flex-row items-center space-x-2 rounded-lg px-4 py-1 text-sm hover:bg-white"
		onclick={toggleForm}
	>
		<IconFolderPlus size={18} />
		<span>{ts.get.notes.new_folder}</span>
	</button>
{/if}
