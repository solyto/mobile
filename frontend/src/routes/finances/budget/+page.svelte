<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import AddBudget from '$lib/components/finances/AddBudget.svelte';
	import BudgetField from '$lib/components/finances/BudgetField.svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import type { Budget, UpdateBudgetRequest } from '$lib/types/finance';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onMount } from 'svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();

	let total = $derived(finances.getBudgetTotal());
	let incomeTotal = $derived(finances.getBudgetIncomeTotal());
	let expenseTotal = $derived(finances.getBudgetExpenseTotal());
	let colorLoaded = $state<boolean>(false);

	async function onChangeValue(budget: Budget, value: number): Promise<void> {
		loadingIndicator.start();
		const request: UpdateBudgetRequest = { value: value };
		await finances.updateBudget(budget, request);
		loadingIndicator.stop();
	}

	async function onDelete(budget: Budget): Promise<void> {
		loadingIndicator.start();
		await finances.deleteBudget(budget);
		loadingIndicator.stop();
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
			class="relative mb-8 flex h-8 w-full items-end rounded-full bg-c-success shadow-md transition-all dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			{#if colorLoaded}
				<div
					class="relative flex h-full items-center justify-center rounded-full rounded-r-none bg-c-danger transition-all"
					style="width: {Math.abs(expenseTotal / incomeTotal) * 100}%;"
					in:slide={{ axis: 'x' }}
				></div>
			{/if}
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="absolute top-[10px] bottom-[10px] left-[10px]">
				<div
					class="h-full w-1 rounded-full transition-all duration-900"
					class:bg-c-success={colorLoaded && total > 0}
					class:bg-c-danger={colorLoaded && total < 0}
				></div>
			</div>
			<div class="flex w-full items-baseline justify-between pl-5">
				<h2 class="text-2xl">{ts.get.finances.total}</h2>
				<div class="text-xl md:text-3xl">
					{total > 0 ? '+ ' : '- '}{europeanFormat(Math.abs(total))}
				</div>
			</div>
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="absolute top-[10px] bottom-[10px] left-[10px]">
				<div
					class="h-full w-1 rounded-full transition-all duration-900"
					class:bg-c-success={colorLoaded}
				></div>
			</div>
			<div class="mb-4 flex w-full flex-row items-center justify-between pl-5">
				<h2 class="text-2xl">{ts.get.finances.income}</h2>
				<AddBudget type="income" />
			</div>
			<div class="flex w-full flex-col gap-1 pl-5">
				{#each finances.income as i (i.id)}
					<BudgetField budget={i} {onChangeValue} />
				{/each}
			</div>
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="absolute top-[10px] bottom-[10px] left-[10px]">
				<div
					class="h-full w-1 rounded-full transition-all duration-900"
					class:bg-c-danger={colorLoaded}
				></div>
			</div>
			<div class="mb-4 flex w-full items-center justify-between pl-5">
				<h2 class="text-2xl">{ts.get.finances.expenses}</h2>
				<AddBudget type="expense" />
			</div>
			<div class="flex w-full flex-col gap-1 pl-5">
				{#each finances.expenses as e (e.id)}
					<BudgetField budget={e} {onChangeValue} />
				{/each}
			</div>
		</div>
	</div>
{/if}
