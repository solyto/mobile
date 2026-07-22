<script lang="ts">
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const contacts = getContacts();

	let input = $state<HTMLInputElement | null>(null);
	let inputValue = $state<string>('');
	let showInput = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	onMount(
		() =>
			(keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 3 }))
	);
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleInput() {
		showInput = !showInput;

		if (showInput) {
			await tick();
			input?.focus();
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	function onblur(): void {
		showInput = false;
		keyManager.unregisterKeyDown(keyHandlers.Escape);
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		if (!showInput) {
			await toggleInput();
			return;
		}

		loadingIndicator.start();

		if (inputValue.trim() !== '') {
			await contacts.createAddressBook({ name: inputValue.trim() });
			notifications.success(ts.get.calendar.create_success);
		}

		await toggleInput();
		loadingIndicator.stop();
	}
</script>

<div class="mt-8 w-full text-right">
	{#if showInput}
		<TextInput bind:input bind:value={inputValue} />
	{:else}
		<AddButton onClick={toggleInput} />
	{/if}
</div>
