<script lang="ts">
	import { slide } from 'svelte/transition';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { formatUserMoney } from '$lib/helpers/NumberHelper.js';
	import AddBudget from '$lib/components/finances/AddBudget.svelte';
	import BudgetField from '$lib/components/finances/BudgetField.svelte';
	import type {
		Budget,
		BudgetInterval,
		FinanceValue,
		StoreFinanceValueRequest,
		UpdateFinanceValueRequest
	} from '$lib/types/finance';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onDestroy, onMount } from 'svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import FinanceHistory from '$lib/components/finances/FinanceHistory.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import BudgetTagPicker from '$lib/components/finances/BudgetTagPicker.svelte';
	import type { MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import { selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();
	const auth = getAuth();
	const COLOR_DELAY_MS = 100;

	let total = $derived(finances.getBudgetTotal());
	let incomeTotal = $derived(finances.getBudgetIncomeTotal());
	let expenseTotal = $derived(finances.getBudgetExpenseTotal());
	let colorLoaded = $state<boolean>(false);
	let historyBudgetId = $state<number | null>(null);
	let historyBudget = $derived([...finances.income, ...finances.expenses].find((budget) => budget.id === historyBudgetId) ?? null);

	function tagFilterOptions(): { label: string; value: string }[] {
		return [{ label: ts.get.finances.all_tags, value: '' }, ...tagEntries(finances.availableTags())];
	}

	function selectTag(value: string): void {
		finances.selectTag(value === '' ? null : Number(value));
	}

	function expenseShare(): number {
		if (incomeTotal <= 0) return expenseTotal > 0 ? 100 : 0;
		return Math.abs(expenseTotal / incomeTotal) * 100;
	}

	async function withLoadingIndicator<T>(action: () => Promise<T>): Promise<T> {
		loadingIndicator.start();
		try {
			return await action();
		} finally {
			loadingIndicator.stop();
		}
	}

	async function openHistory(budget: Budget): Promise<void> {
		if (await withLoadingIndicator(() => finances.loadBudgetValues(budget))) historyBudgetId = budget.id;
	}

	function closeHistory(): void {
		historyBudgetId = null;
	}

	async function deleteHistoryBudget(): Promise<void> {
		if (historyBudget === null) return;
		const budget = historyBudget;
		await withLoadingIndicator(() => finances.deleteBudget(budget));
		closeHistory();
	}

	async function renameHistoryBudget(title: string): Promise<boolean> {
		if (historyBudget === null) return false;
		const budget = historyBudget;
		return withLoadingIndicator(() => finances.updateBudget(budget, { title }));
	}

	async function changeHistoryInterval(value: string): Promise<void> {
		if (historyBudget === null) return;
		const budget = historyBudget;
		await withLoadingIndicator(() => finances.updateBudget(budget, { interval: value as BudgetInterval }));
	}

	async function changeHistoryTags(entries: MultiSelectEntry[]): Promise<void> {
		if (historyBudget === null) return;
		const budget = historyBudget;
		await withLoadingIndicator(async () => {
			const ok = await finances.updateBudget(budget, { tags: selectedIds(entries) });
			// The picker keeps what was picked; reloading puts it back to the saved tags.
			if (!ok) await finances.loadIncome();
		});
	}

	async function addHistoryValue(request: StoreFinanceValueRequest): Promise<boolean> {
		if (historyBudget === null) return false;
		const budget = historyBudget;
		return withLoadingIndicator(() => finances.addBudgetValue(budget, request));
	}

	async function updateHistoryValue(value: FinanceValue, request: UpdateFinanceValueRequest): Promise<boolean> {
		if (historyBudget === null) return false;
		const budget = historyBudget;
		return withLoadingIndicator(() => finances.updateBudgetValue(budget, value, request));
	}

	async function deleteHistoryValue(value: FinanceValue): Promise<boolean> {
		if (historyBudget === null) return false;
		const budget = historyBudget;
		return withLoadingIndicator(() => finances.deleteBudgetValue(budget, value));
	}

	function dateFormat(): string | null {
		return auth.user?.settings?.date_format ?? null;
	}

	function formatMoney(value: number): string {
		return formatUserMoney(value, auth.user?.settings);
	}

	onMount(() => {
		setTimeout(() => {
			colorLoaded = true;
		}, COLOR_DELAY_MS);
	});

	// The finances overview shares the store and always shows the whole budget.
	onDestroy(() => finances.selectTag(null));
</script>

{#if finances.budgetLoaded}
	<div class="flex w-full flex-col items-start gap-4">
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="flex w-full items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<h2 class="text-2xl font-semibold">{ts.get.finances.total}</h2>
					{#if finances.availableTags().length > 0}
						<div class="w-40">
							<Select
								value={finances.selectedTagId?.toString() ?? ''}
								options={tagFilterOptions()}
								onchange={selectTag}
								ariaLabel={ts.get.finances.tag_filter}
							/>
						</div>
					{/if}
				</div>
				<div class="text-xl tabular-nums md:text-3xl">
					{total > 0 ? '+ ' : '- '}{formatMoney(Math.abs(total))}
				</div>
			</div>
			<div class="mt-4 flex h-2 items-end rounded-full bg-c-success opacity-80 transition-all">
				{#if colorLoaded}
					<div
						class="relative flex h-full items-center justify-center rounded-full rounded-r-none bg-c-danger transition-all"
						style="width: {expenseShare()}%;"
						in:slide={{ axis: 'x' }}
					></div>
				{/if}
			</div>
		</div>
		<div class="grid w-full items-start gap-4 xl:grid-cols-2">
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
			>
				<div class="mb-4 flex w-full flex-row items-center justify-between">
					<div class="flex items-baseline gap-3">
						<h2 class="text-2xl font-semibold">{ts.get.finances.income}</h2>
						<span class="text-lg text-c-neutral-5 tabular-nums">+ {formatMoney(incomeTotal)}</span>
					</div>
					<AddBudget type="income" showTags={finances.tagsSupported} />
				</div>
				<div class="flex w-full flex-col gap-1">
					{#each finances.filteredIncome() as i (i.id)}
						<BudgetField
							budget={i}
							sectionTotal={incomeTotal}
							onOpenHistory={openHistory}
							valueFormatter={formatMoney}
						/>
					{/each}
				</div>
			</div>
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
			>
				<div class="mb-4 flex w-full items-center justify-between">
					<div class="flex items-baseline gap-3">
						<h2 class="text-2xl font-semibold">{ts.get.finances.expenses}</h2>
						<span class="text-lg text-c-neutral-5 tabular-nums">- {formatMoney(expenseTotal)}</span>
					</div>
					<AddBudget type="expense" showTags={finances.tagsSupported} />
				</div>
				<div class="flex w-full flex-col gap-1">
					{#each finances.filteredExpenses() as e (e.id)}
						<BudgetField
							budget={e}
							sectionTotal={expenseTotal}
							onOpenHistory={openHistory}
							valueFormatter={formatMoney}
						/>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
{#if historyBudget}
	<ContentModal title={historyBudget.title} showTitleOnMobile={true} rounded="2xl" onClose={closeHistory} onRename={renameHistoryBudget}>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<Select
				value={finances.budgetIntervals.intervalOf(historyBudget)}
				options={finances.budgetIntervals.options(ts.get.finances)}
				onchange={changeHistoryInterval}
				ariaLabel={ts.get.finances.interval}
			/>
			{#if finances.tagsSupported}
				<BudgetTagPicker value={tagEntries(historyBudget.tags)} onchange={changeHistoryTags} />
			{/if}
		</div>
		<Divider my={8} />
		<FinanceHistory
			values={finances.budgetValues}
			minValues={1}
			onAdd={addHistoryValue}
			onUpdate={updateHistoryValue}
			onDelete={deleteHistoryValue}
			itemTitle={historyBudget.title}
			dateFormat={dateFormat()}
			onDeleteItem={deleteHistoryBudget}
			valueFormatter={formatMoney}
		/>
	</ContentModal>
{/if}
