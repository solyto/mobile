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
	import { europeanFormat } from '$lib/helpers/NumberHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import WealthStatisticsService from '$lib/services/WealthStatisticsService';
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

	let statistics = $derived.by(() => {
		statisticsService.setData(finances.wealth);
		return statisticsService.getGraphValues();
	});
	let historyFieldId = $state<number | null>(null);
	let historyField = $derived(finances.wealth.find((field) => field.id === historyFieldId) ?? null);

	function openHistory(wealth: WealthField): void {
		historyFieldId = wealth.id;
	}

	function closeHistory(): void {
		historyFieldId = null;
	}

	async function deleteHistoryField(): Promise<void> {
		if (historyField === null) return;
		loadingIndicator.start();
		await finances.deleteWealthField(historyField);
		loadingIndicator.stop();
		closeHistory();
	}

	async function renameHistoryField(title: string): Promise<boolean> {
		if (historyField === null) return false;
		loadingIndicator.start();
		const ok = await finances.updateWealthField(historyField, { title });
		loadingIndicator.stop();
		return ok;
	}

	async function addHistoryValue(request: StoreFinanceValueRequest): Promise<boolean> {
		if (historyField === null) return false;
		loadingIndicator.start();
		const ok = await finances.addWealthValue(historyField, request);
		loadingIndicator.stop();
		return ok;
	}

	async function updateHistoryValue(value: FinanceValue, request: UpdateFinanceValueRequest): Promise<boolean> {
		if (historyField === null) return false;
		loadingIndicator.start();
		const ok = await finances.updateWealthValue(historyField, value, request);
		loadingIndicator.stop();
		return ok;
	}

	async function deleteHistoryValue(value: FinanceValue): Promise<boolean> {
		if (historyField === null) return false;
		loadingIndicator.start();
		const ok = await finances.deleteWealthValue(historyField, value);
		loadingIndicator.stop();
		return ok;
	}

	function getSeriesData(stats: typeof statistics) {
		if (stats.length === 0) return [];

		return finances.wealth.map((field) => {
			return {
				title: field.title,
				values: stats.map((stat) => {
					const found = stat.values.find((v) => v.field === field.title);
					return found ? found.value : 0;
				})
			};
		});
	}

	function getTotalSeriesData(stats: typeof statistics) {
		if (stats.length === 0) return [];

		return stats.map((stat) => {
			return stat.values.reduce((sum, v) => sum + v.value, 0);
		});
	}
</script>

{#if finances.wealthLoaded}
	<div class="flex flex-col gap-4" in:fade>
		<div class="mb-8 w-full">
			<DoughnutChart
				title=""
				values={finances.wealth.map((wealth) => ({
					value: wealth.currentValue?.value ?? 0,
					name: wealth.title
				}))}
			/>
		</div>
		<div
			class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<h2 class="text-2xl font-semibold">{ts.get.finances.total}</h2>
				<span class="text-xl tabular-nums md:text-3xl">{europeanFormat(finances.getWealthSum())}</span>
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
					<WealthFieldDisplay {wealth} sectionTotal={finances.getWealthSum()} onOpenHistory={openHistory} />
				{/each}
			</div>
		</div>
		{#if finances.wealth.length > 0}
			<h2 class="mt-8 text-2xl">{ts.get.finances.history}</h2>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
				<SubHeading title={ts.get.finances.history_development} my={0} mb={8} />
				<SmoothLineChart
					categories={statisticsService.getMonthLabels(statistics, auth.user?.settings?.date_format ?? null)}
					values={getTotalSeriesData(statistics)}
					min={statisticsService.getTrendMin(getTotalSeriesData(statistics))}
					filled={true}
				/>
			</div>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
				<SubHeading title={ts.get.finances.history_composition} my={0} mb={8} />
				<StackedAreaChart
					xCategories={statisticsService.getMonthLabels(statistics, auth.user?.settings?.date_format ?? null)}
					dataPoints={getSeriesData(statistics)}
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
			dateFormat={auth.user?.settings?.date_format ?? null}
			onDeleteItem={deleteHistoryField}
		/>
	</ContentModal>
{/if}
