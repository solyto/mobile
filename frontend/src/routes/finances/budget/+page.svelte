<script lang="ts">
	import { slide } from 'svelte/transition';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import AddBudget from '$lib/components/finances/AddBudget.svelte';
	import BudgetField from '$lib/components/finances/BudgetField.svelte';
	import type {
		Budget,
		FinanceValue,
		StoreFinanceValueRequest,
		UpdateFinanceValueRequest
	} from '$lib/types/finance';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onMount } from 'svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import FinanceHistory from '$lib/components/finances/FinanceHistory.svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();
	const auth = getAuth();

	let total = $derived(finances.getBudgetTotal());
	let incomeTotal = $derived(finances.getBudgetIncomeTotal());
	let expenseTotal = $derived(finances.getBudgetExpenseTotal());
	let colorLoaded = $state<boolean>(false);
	let historyBudget = $state<Budget | null>(null);

	async function openHistory(budget: Budget): Promise<void> {
		loadingIndicator.start();
		const ok = await finances.loadBudgetValues(budget);
		loadingIndicator.stop();
		if (ok) historyBudget = budget;
	}

	function closeHistory(): void {
		historyBudget = null;
	}

	async function deleteHistoryBudget(): Promise<void> {
		if (historyBudget === null) return;
		loadingIndicator.start();
		await finances.deleteBudget(historyBudget);
		loadingIndicator.stop();
		closeHistory();
	}

	async function renameHistoryBudget(title: string): Promise<boolean> {
		if (historyBudget === null) return false;
		loadingIndicator.start();
		const ok = await finances.updateBudget(historyBudget, { title });
		loadingIndicator.stop();
		if (ok) historyBudget = { ...historyBudget, title };
		return ok;
	}

	async function addHistoryValue(request: StoreFinanceValueRequest): Promise<boolean> {
		if (historyBudget === null) return false;
		loadingIndicator.start();
		const ok = await finances.addBudgetValue(historyBudget, request);
		loadingIndicator.stop();
		return ok;
	}

	async function updateHistoryValue(value: FinanceValue, request: UpdateFinanceValueRequest): Promise<boolean> {
		if (historyBudget === null) return false;
		loadingIndicator.start();
		const ok = await finances.updateBudgetValue(historyBudget, value, request);
		loadingIndicator.stop();
		return ok;
	}

	async function deleteHistoryValue(value: FinanceValue): Promise<boolean> {
		if (historyBudget === null) return false;
		loadingIndicator.start();
		const ok = await finances.deleteBudgetValue(historyBudget, value);
		loadingIndicator.stop();
		return ok;
	}

	onMount(() => {
		setTimeout(() => {
			colorLoaded = true;
		}, 100);
	});
</script>

{#if finances.budgetLoaded}
	<div class="flex w-full flex-col items-start gap-4">
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="flex w-full items-baseline justify-between">
				<h2 class="text-2xl font-semibold">{ts.get.finances.total}</h2>
				<div class="text-xl tabular-nums md:text-3xl">
					{total > 0 ? '+ ' : '- '}{europeanFormat(Math.abs(total))}
				</div>
			</div>
			<div class="mt-4 flex h-2 items-end rounded-full bg-c-success opacity-80 transition-all">
				{#if colorLoaded}
					<div
						class="relative flex h-full items-center justify-center rounded-full rounded-r-none bg-c-danger transition-all"
						style="width: {Math.abs(expenseTotal / incomeTotal) * 100}%;"
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
						<span class="text-lg text-c-neutral-5 tabular-nums">+ {europeanFormat(incomeTotal)}</span>
					</div>
					<AddBudget type="income" />
				</div>
				<div class="flex w-full flex-col gap-1">
					{#each finances.income as i (i.id)}
						<BudgetField budget={i} sectionTotal={incomeTotal} onOpenHistory={openHistory} />
					{/each}
				</div>
			</div>
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
			>
				<div class="mb-4 flex w-full items-center justify-between">
					<div class="flex items-baseline gap-3">
						<h2 class="text-2xl font-semibold">{ts.get.finances.expenses}</h2>
						<span class="text-lg text-c-neutral-5 tabular-nums">- {europeanFormat(expenseTotal)}</span>
					</div>
					<AddBudget type="expense" />
				</div>
				<div class="flex w-full flex-col gap-1">
					{#each finances.expenses as e (e.id)}
						<BudgetField budget={e} sectionTotal={expenseTotal} onOpenHistory={openHistory} />
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
{#if historyBudget}
	<ContentModal title={historyBudget.title} showTitleOnMobile={true} rounded="2xl" onClose={closeHistory} onRename={renameHistoryBudget}>
		<FinanceHistory
			values={finances.budgetValues}
			minValues={1}
			onAdd={addHistoryValue}
			onUpdate={updateHistoryValue}
			onDelete={deleteHistoryValue}
			itemTitle={historyBudget.title}
			dateFormat={auth.user?.settings?.date_format ?? null}
			onDeleteItem={deleteHistoryBudget}
		/>
	</ContentModal>
{/if}
