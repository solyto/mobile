<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import type { CreateWealthFieldRequest } from '$lib/types/finance';
	import IconPlus from '@lucide/svelte/icons/plus';

	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const finances = getFinances();

	let formOpen = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>('');
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleForm() {
		formOpen = !formOpen;

		if (formOpen) {
			await tick();
			titleInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function onblur(): void {
		formOpen = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		loadingIndicator.start();

		if (titleValue.trim() !== '') {
			const request: CreateWealthFieldRequest = {
				title: titleValue.trim()
			};
			const res = await finances.addWealthField(request);
			if (res) {
				titleValue = '';
				await toggleForm();
				loadingIndicator.stop();
				keyManager.unregisterKeyDown(keyHandlers.Enter);
			}
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}
</script>

<div class="flex justify-start">
	{#if formOpen}
		<TextInput placeholder="Title" bind:input={titleInput} bind:value={titleValue} />
	{:else}
		<button class="cursor-pointer rounded-lg p-2 transition-all" onclick={toggleForm}>
			<IconPlus />
		</button>
	{/if}
</div>
