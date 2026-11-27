<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import AddWealthField from '$lib/components/finances/AddWealthField.svelte';
	import WealthFieldDisplay from '$lib/components/finances/WealthField.svelte';
	import type {
		WealthField,
		FinanceValue,
		StoreFinanceValueRequest,
		UpdateFinanceValueRequest
	} from '$lib/types/finance';
	import { formatUserMoney, userMoneyFormatKey } from '$lib/helpers/NumberHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import WealthStatisticsService, { wealthRanges, type WealthRangeKey } from '$lib/services/WealthStatisticsService';
	import WealthRangeControl from '$lib/components/finances/WealthRangeControl.svelte';
	import StackedAreaChart from '$lib/components/charts/StackedAreaChart.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import FinanceHistory from '$lib/components/finances/FinanceHistory.svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();
	const auth = getAuth();
	const statisticsService = new WealthStatisticsService();

	let range = $state<WealthRangeKey>('1y');
	let statistics = $derived(statisticsService.getGraphValues(finances.wealth, wealthRanges[range]));
	let totals = $derived(statisticsService.getTotals(statistics));
	let historyFieldId = $state<number | null>(null);
	let historyField = $derived(finances.wealth.find((field) => field.id === historyFieldId) ?? null);

	function openHistory(wealth: WealthField): void {
		historyFieldId = wealth.id;
	}

	function closeHistory(): void {
		historyFieldId = null;
	}

	async function withLoadingIndicator<T>(action: () => Promise<T>): Promise<T> {
		loadingIndicator.start();
		try {
			return await action();
		} finally {
			loadingIndicator.stop();
		}
	}

	async function deleteHistoryField(): Promise<void> {
		if (historyField === null) return;
		const field = historyField;
		await withLoadingIndicator(() => finances.deleteWealthField(field));
		closeHistory();
	}

	async function renameHistoryField(title: string): Promise<boolean> {
		if (historyField === null) return false;
		const field = historyField;
		return withLoadingIndicator(() => finances.updateWealthField(field, { title }));
	}

	async function addHistoryValue(request: StoreFinanceValueRequest): Promise<boolean> {
		if (historyField === null) return false;
		const field = historyField;
		return withLoadingIndicator(() => finances.addWealthValue(field, request));
	}

	async function updateHistoryValue(value: FinanceValue, request: UpdateFinanceValueRequest): Promise<boolean> {
		if (historyField === null) return false;
		const field = historyField;
		return withLoadingIndicator(() => finances.updateWealthValue(field, value, request));
	}

	async function deleteHistoryValue(value: FinanceValue): Promise<boolean> {
		if (historyField === null) return false;
		const field = historyField;
		return withLoadingIndicator(() => finances.deleteWealthValue(field, value));
	}

	function dateFormat(): string | null {
		return auth.user?.settings?.date_format ?? null;
	}

	function formatMoney(value: number): string {
		return formatUserMoney(value, auth.user?.settings);
	}
</script>

{#if finances.wealthLoaded}
	<div class="flex flex-col gap-4" in:fade>
		<div class="mb-8 w-full">
			{#key userMoneyFormatKey(auth.user?.settings)}
				<DoughnutChart
					title=""
					values={statisticsService.getDistribution(finances.wealth)}
					centerFormatter={formatMoney}
					valueFormatter={formatMoney}
				/>
			{/key}
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<h2 class="text-2xl font-semibold">{ts.get.finances.total}</h2>
				<span class="text-xl tabular-nums md:text-3xl">{formatMoney(finances.getWealthSum())}</span>
			</div>
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="mb-4 flex w-full flex-row items-center justify-between">
				<h2 class="text-2xl font-semibold">{ts.get.finances.positions}</h2>
				<AddWealthField />
			</div>
			<div class="flex flex-col gap-1">
				{#each finances.wealth as wealth (wealth.id)}
					<WealthFieldDisplay
						{wealth}
						sectionTotal={finances.getWealthSum()}
						onOpenHistory={openHistory}
						valueFormatter={formatMoney}
					/>
				{/each}
			</div>
		</div>
		{#if finances.wealth.length > 0}
			<div class="mt-8 flex flex-wrap items-center justify-between gap-2">
				<h2 class="text-2xl">{ts.get.finances.history}</h2>
				<WealthRangeControl bind:value={range} />
			</div>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
				<SubHeading title={ts.get.finances.history_development} my={0} mb={8} />
				<SmoothLineChart
					categories={statisticsService.getMonthLabels(statistics, dateFormat())}
					values={totals}
					min={statisticsService.getTrendMin(totals)}
					valueFormatter={formatMoney}
					filled={true}
				/>
			</div>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
				<SubHeading title={ts.get.finances.history_composition} my={0} mb={8} />
				<StackedAreaChart
					xCategories={statisticsService.getMonthLabels(statistics, dateFormat())}
					dataPoints={statisticsService.getSeriesByField(finances.wealth, statistics)}
					valueFormatter={formatMoney}
				/>
			</div>
		{/if}
	</div>
{/if}
{#if historyField}
	<ContentModal title={historyField.title} showTitleOnMobile={true} rounded="2xl" onClose={closeHistory} onRename={renameHistoryField}>
		<FinanceHistory
			values={historyField.values}
			onAdd={addHistoryValue}
			onUpdate={updateHistoryValue}
			onDelete={deleteHistoryValue}
			itemTitle={historyField.title}
			dateFormat={dateFormat()}
			onDeleteItem={deleteHistoryField}
			valueFormatter={formatMoney}
		/>
	</ContentModal>
{/if}
