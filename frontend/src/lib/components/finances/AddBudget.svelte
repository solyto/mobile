<script lang="ts">
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import type { BudgetInterval, BudgetType, CreateBudgetRequest } from '$lib/types/finance';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import type { MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import BudgetTagPicker from '$lib/components/finances/BudgetTagPicker.svelte';
	import { selectedIds } from '$lib/helpers/MultiSelectHelper';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const finances = getFinances();

	let { type, showTags }: { type: BudgetType; showTags: boolean } = $props();

	let formOpen = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>('');
	let valueInput = $state<HTMLInputElement | null>(null);
	let valueValue = $state<number | null>(null);
	let intervalValue = $state<BudgetInterval>('monthly');
	let selectedTags = $state<MultiSelectEntry[]>([]);
	// No Enter-to-save: Enter belongs to the tag picker, where it creates a tag.
	let keyHandlers: { [key: string]: string | null } = { Escape: null };

	async function open(): Promise<void> {
		formOpen = true;
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', close);
		await tick();
		titleInput?.focus();
	}

	function close(): void {
		formOpen = false;
		keyManager.unregisterAll(keyHandlers);
		keyHandlers.Escape = null;
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function selectInterval(value: string): void {
		intervalValue = value as BudgetInterval;
	}

	function resetForm(): void {
		titleValue = '';
		valueValue = null;
		intervalValue = 'monthly';
		selectedTags = [];
	}

	async function onSubmit(): Promise<void> {
		if (titleValue.trim() === '' || valueValue === null) return;

		const request: CreateBudgetRequest = {
			type: type,
			title: titleValue.trim(),
			value: valueValue,
			interval: intervalValue,
			tags: selectedTags.length > 0 ? selectedIds(selectedTags) : undefined
		};

		loadingIndicator.start();
		try {
			if (!(await finances.addBudget(request))) return;
		} finally {
			loadingIndicator.stop();
		}

		resetForm();
		close();
	}
</script>

{#if formOpen}
	<ContentModal title={ts.get.finances.add_entry} showTitleOnMobile={true} rounded="2xl" p="6" onClose={close}>
		<div class="flex flex-row gap-2">
			<TextInput placeholder={ts.get.finances.title_placeholder} bind:input={titleInput} bind:value={titleValue} />
			<NumberInput placeholder={ts.get.finances.value_placeholder} bind:input={valueInput} bind:value={valueValue} />
		</div>
		<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
			<Select
				value={intervalValue}
				options={finances.budgetIntervals.options(ts.get.finances)}
				onchange={selectInterval}
				ariaLabel={ts.get.finances.interval}
			/>
			{#if showTags}
				<BudgetTagPicker bind:value={selectedTags} />
			{/if}
		</div>
		<TextButton title={ts.get.layout.modal_confirm} type="action" onclick={onSubmit} class="mt-8 w-full" />
	</ContentModal>
{/if}
<div class="flex justify-start">
	<AddButton colorOnHover={true} hoverColor={type === 'income' ? 'success' : 'danger'} onClick={open} />
</div>
