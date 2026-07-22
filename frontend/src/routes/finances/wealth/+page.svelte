<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import AddWealthField from '$lib/components/finances/AddWealthField.svelte';
	import WealthFieldDisplay from '$lib/components/finances/WealthField.svelte';
	import type { WealthField, UpdateWealthValueRequest } from '$lib/types/finance';
	import { europeanFormat } from '$lib/helpers/NumberHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import { onMount } from 'svelte';
	import WealthStatisticsService from '$lib/services/WealthStatisticsService';
	import StackedAreaChart from '$lib/components/charts/StackedAreaChart.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();
	const statisticsService = new WealthStatisticsService();

	let colorLoaded = $state<boolean>(false);
	let statistics = $state<{ date: string; values: { field: string; value: number }[] }[]>([]);
	let showHistory = $state<boolean>(false);

	async function onChangeValue(wealth: WealthField, value: number): Promise<void> {
		loadingIndicator.start();
		const request: UpdateWealthValueRequest = { value: value };
		await finances.addWealthValue(wealth, request);
		loadingIndicator.stop();
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

	onMount(() => {
		statisticsService.setData(finances.wealth);

		setTimeout(() => {
			colorLoaded = true;
		}, 100);

		statistics = statisticsService.getGraphValues() as unknown as {
			date: string;
			values: { field: string; value: number }[];
		}[];
	});
</script>

{#if finances.wealthLoaded}
	<TextButton
		title={showHistory ? ts.get.finances.hide_history : ts.get.finances.show_history}
		onclick={() => {
			showHistory = !showHistory;
		}}
		class="absolute top-6 right-6 z-40"
	/>
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
			<div class="absolute top-[10px] bottom-[10px] left-[10px]">
				<div
					class="h-full w-1 rounded-full transition-all duration-900"
					class:bg-c-success={colorLoaded}
				></div>
			</div>
			<div class="flex w-full flex-row items-center justify-between pl-5">
				<h2 class="text-2xl">{ts.get.finances.total}</h2>
				<span class="text-xl md:text-3xl">{europeanFormat(finances.getWealthSum())}</span>
			</div>
			{#if showHistory}
				<div class="mt-8 flex w-full flex-col items-center justify-center">
					<Divider width="95%" />
					<div class="w-full" transition:slide>
						<SmoothLineChart
							categories={statistics.map((stat) => stat.date)}
							values={getTotalSeriesData(statistics)}
							filled={true}
						/>
					</div>
				</div>
			{/if}
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
				<h2 class="text-2xl">{ts.get.finances.positions}</h2>
				<AddWealthField />
			</div>
			<div class="flex flex-col gap-1 pl-5">
				{#each finances.wealth as wealth (wealth.id)}
					<WealthFieldDisplay {wealth} {onChangeValue} />
				{/each}
			</div>
			{#if showHistory}
				<div class="mt-8 flex w-full flex-col items-center justify-center">
					<Divider width="95%" />
					<div class="w-full" transition:slide>
						<StackedAreaChart
							xCategories={statistics.map((stat) => stat.date)}
							dataPoints={getSeriesData(statistics)}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
