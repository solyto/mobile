<script lang="ts">
	import type {
		FinanceValue,
		FinanceValueForm,
		StoreFinanceValueRequest,
		UpdateFinanceValueRequest
	} from '$lib/types/finance';
	import FinanceHistoryService from '$lib/services/FinanceHistoryService';
	import { formatDate, getUrlFormat } from '$lib/helpers/DateHelper';
	import { europeanFormat } from '$lib/helpers/NumberHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy } from 'svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconPen from '@lucide/svelte/icons/pen';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';

	const ts = getTranslation();
	const keyManager = getKeyManager();
	const history = new FinanceHistoryService();
	const HINT = 'text-sm text-c-neutral-5';

	let {
		values,
		itemTitle,
		dateFormat,
		minValues = 0,
		onAdd,
		onUpdate,
		onDelete,
		onDeleteItem
	}: {
		values: FinanceValue[];
		itemTitle: string;
		dateFormat: string | null;
		minValues?: number;
		onAdd: (request: StoreFinanceValueRequest) => Promise<boolean>;
		onUpdate: (value: FinanceValue, request: UpdateFinanceValueRequest) => Promise<boolean>;
		onDelete: (value: FinanceValue) => Promise<boolean>;
		onDeleteItem: () => Promise<void>;
	} = $props();

	let today = getUrlFormat(new Date());
	let addOpen = $state<boolean>(false);
	let addForm = $state<FinanceValueForm>(history.emptyForm(new Date()));
	let editingId = $state<number | null>(null);
	let editForm = $state<FinanceValueForm>(history.emptyForm(new Date()));
	let deleteCandidate = $state<FinanceValue | null>(null);
	let deleteItemConfirmOpen = $state<boolean>(false);
	let addKeyHandlers: Record<string, string | null> = { Enter: null, Escape: null };
	let editKeyHandlers: Record<string, string | null> = { Enter: null, Escape: null };

	function replacesHint(): string | null {
		const replaced = history.findByDate(values, addForm.date);
		return replaced ? ts.get.finances.replaces_value.replace('%s', europeanFormat(replaced.value)) : null;
	}

	function isEditDateTaken(): boolean {
		return editingId !== null && history.findOtherByDate(values, editForm.date, editingId) !== null;
	}

	function openAdd(): void {
		keyManager.unregisterAll(addKeyHandlers);
		addForm = history.emptyForm(new Date());
		addOpen = true;
		addKeyHandlers.Enter = keyManager.registerKeyDown('Enter', () => add(), { priority: 3 });
		addKeyHandlers.Escape = keyManager.registerKeyDown('Escape', () => closeAdd(), { priority: 3 });
	}

	function closeAdd(): void {
		keyManager.unregisterAll(addKeyHandlers);
		addOpen = false;
	}

	async function add(): Promise<void> {
		const request = history.toRequest(addForm);
		if (request === null) return;
		if (await onAdd(request)) closeAdd();
	}

	function startEdit(value: FinanceValue): void {
		keyManager.unregisterAll(editKeyHandlers);
		editForm = history.toForm(value);
		editingId = value.id;
		editKeyHandlers.Enter = keyManager.registerKeyDown('Enter', () => saveEdit(value), { priority: 2 });
		editKeyHandlers.Escape = keyManager.registerKeyDown('Escape', () => cancelEdit(), { priority: 2 });
	}

	function cancelEdit(): void {
		keyManager.unregisterAll(editKeyHandlers);
		editingId = null;
	}

	async function saveEdit(value: FinanceValue): Promise<void> {
		const request = history.toRequest(editForm);
		if (request === null || isEditDateTaken()) return;
		if (await onUpdate(value, request)) cancelEdit();
	}

	function askDelete(value: FinanceValue): void {
		deleteCandidate = value;
	}

	function cancelDelete(): void {
		deleteCandidate = null;
	}

	async function confirmDelete(): Promise<void> {
		if (deleteCandidate === null) return;
		const value = deleteCandidate;
		deleteCandidate = null;
		await onDelete(value);
	}

	async function confirmDeleteItem(): Promise<void> {
		deleteItemConfirmOpen = false;
		await onDeleteItem();
	}

	onDestroy(() => {
		keyManager.unregisterAll(addKeyHandlers);
		keyManager.unregisterAll(editKeyHandlers);
	});
</script>

<div class="flex w-full flex-col gap-6 md:w-2xl">
	{#if values.length > 1}
		<SmoothLineChart
			categories={history.chartCategories(values, dateFormat)}
			values={history.chartValues(values)}
			filled={true}
			class="h-56"
		/>
	{/if}
	{#if addOpen}
		<div class="flex flex-col gap-2">
			<div class="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
				<DateInput bind:value={addForm.date} max={today} />
				<NumberInput bind:value={addForm.value} placeholder={ts.get.finances.amount} />
				<CloseButton onClick={closeAdd} inModal={false} />
				<SaveButton onClick={add} />
			</div>
			{#if replacesHint()}
				<p class={HINT}>{replacesHint()}</p>
			{/if}
		</div>
	{:else}
		<div class="flex justify-end">
			<TextButton title={ts.get.finances.new_entry} onclick={openAdd} />
		</div>
	{/if}
	{#if values.length === 0}
		<p class={HINT}>{ts.get.finances.no_values}</p>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each history.sortNewestFirst(values) as value (value.id)}
				<li class="flex min-h-10 flex-col gap-1">
					{#if editingId === value.id}
						<div class="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
							<DateInput bind:value={editForm.date} max={today} />
							<NumberInput bind:value={editForm.value} placeholder={ts.get.finances.amount} />
							<CloseButton onClick={cancelEdit} inModal={false} />
							<SaveButton onClick={() => saveEdit(value)} />
						</div>
						{#if isEditDateTaken()}
							<p class={HINT}>{ts.get.finances.date_taken}</p>
						{/if}
					{:else}
						<div class="flex items-center gap-4">
							<span class="flex-1">{formatDate(history.toLocalDate(value), dateFormat)}</span>
							<span>{europeanFormat(value.value)}</span>
							<button
								type="button"
								class="cursor-pointer"
								aria-label={ts.get.finances.edit_value}
								title={ts.get.finances.edit_value}
								onclick={() => startEdit(value)}
							>
								<IconPen class="size-5 text-c-neutral-3 transition-all hover:text-c-action" />
							</button>
							{#if values.length > minValues}
								<button
									type="button"
									class="cursor-pointer"
									aria-label={ts.get.finances.delete_value_label}
									title={ts.get.finances.delete_value_label}
									onclick={() => askDelete(value)}
								>
									<IconTrash class="size-5 text-c-neutral-3 transition-all hover:text-c-danger" />
								</button>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	<div class="flex justify-center">
		<button
			type="button"
			class="cursor-pointer text-sm text-c-neutral-5 transition-all hover:text-c-danger"
			onclick={() => (deleteItemConfirmOpen = true)}
		>
			{ts.get.finances.delete_item.replace('%s', itemTitle)}
		</button>
	</div>
</div>
{#if deleteCandidate}
	<ConfirmationModal
		title={ts.get.finances.delete_value_label}
		description={ts.get.finances.delete_value_message}
		type="confirm-delete"
		onConfirm={confirmDelete}
		onCancel={cancelDelete}
	/>
{/if}
{#if deleteItemConfirmOpen}
	<ConfirmationModal
		title={ts.get.finances.delete_item.replace('%s', itemTitle)}
		description={ts.get.finances.delete_item_message.replace('%s', itemTitle)}
		type="confirm-delete"
		onConfirm={confirmDeleteItem}
		onCancel={() => (deleteItemConfirmOpen = false)}
	/>
{/if}
