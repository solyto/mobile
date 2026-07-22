<script lang="ts">
	import type { WealthField } from '$lib/types/finance';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';

	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const finances = getFinances();

	let { wealth, onChangeValue } = $props<{
		wealth: WealthField;
		onChangeValue: (wealth: WealthField, value: number) => void | Promise<void>;
	}>();

	let formOpen = $state<boolean>(false);
	let valueInput = $state<HTMLInputElement | null>(null);
	let valueValue = $state<number>(wealth.currentValue ? wealth.currentValue.value : 0);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleForm() {
		formOpen = !formOpen;

		if (formOpen) {
			await tick();
			valueInput?.focus();

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
		onChangeValue(wealth, valueValue);
		await toggleForm();
		keyManager.unregisterAll(keyHandlers);
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function onDelete(wealth: WealthField): Promise<void> {
		loadingIndicator.start();
		await finances.deleteWealthField(wealth);
		loadingIndicator.stop();
	}
</script>

<div class="group flex w-full flex-row items-center justify-between">
	<div class="flex items-center gap-4 text-lg">
		<span>{wealth.title}</span>
		<button
			class="cursor-pointer opacity-0 transition-all group-hover:opacity-100"
			onclick={() => onDelete(wealth)}
		>
			<IconTrash class="size-4 text-c-danger" />
		</button>
	</div>
	{#if formOpen}
		<div class="w-1/2">
			<NumberInput bind:input={valueInput} bind:value={valueValue} placeholder="" />
		</div>
	{:else}
		<button class="cursor-text" ondblclick={() => toggleForm()}>
			{wealth.currentValue ? europeanFormat(wealth.currentValue.value) : 0}
		</button>
	{/if}
</div>
