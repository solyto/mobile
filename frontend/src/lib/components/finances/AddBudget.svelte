<script lang="ts">
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import type { BudgetType, CreateBudgetRequest } from '$lib/types/finance';
	import IconPlus from '@lucide/svelte/icons/plus';

	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const finances = getFinances();

	let { type } = $props<{ type: BudgetType }>();

	let formOpen = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>('');
	let valueInput = $state<HTMLInputElement | null>(null);
	let valueValue = $state<number | null>(null);
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

		if (titleValue.trim() !== '' && valueValue !== null) {
			const request: CreateBudgetRequest = {
				type: type,
				title: titleValue.trim(),
				value: valueValue
			};
			const res = await finances.addBudget(request);
			if (res) {
				titleValue = '';
				valueValue = null;
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
		<div class="flex flex-row gap-2">
			<TextInput placeholder="Title" bind:input={titleInput} bind:value={titleValue} />
			<NumberInput placeholder="Value" bind:input={valueInput} bind:value={valueValue} />
		</div>
	{:else}
		<button
			class="cursor-pointer rounded-lg p-2 transition-all hover:text-white"
			class:hover:bg-c-success={type === 'income'}
			class:hover:bg-c-danger={type === 'expense'}
			onclick={toggleForm}
		>
			<IconPlus />
		</button>
	{/if}
</div>
