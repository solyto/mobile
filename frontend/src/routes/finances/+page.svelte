<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import type { FinancePage } from '$lib/types/finance';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import WealthStatisticsService from '$lib/services/WealthStatisticsService';

	const ts = getTranslation();
	const finances = getFinances();

	let colorLoaded = $state<boolean>(false);
	const setActivePage = (type: FinancePage) => (finances.activePage = type);
	const statisticsService = new WealthStatisticsService();
	let statistics = $state<{ date: string; values: { field: string; value: number }[] }[]>([]);

	$effect(() => {
		if (finances.wealthLoaded) {
			statisticsService.setData(finances.wealth);
			statistics = statisticsService.getGraphValues() as unknown as {
				date: string;
				values: { field: string; value: number }[];
			}[];
		}
	});

	onMount(() => {
		setTimeout(() => {
			colorLoaded = true;
		}, 100);
	});

	function getTotalSeriesData(stats: typeof statistics) {
		if (stats.length === 0) return [];
		return stats.map((stat) => stat.values.reduce((sum, v) => sum + v.value, 0));
	}
</script>

<div class="flex w-full flex-col gap-4">
	{#if finances.wealthLoaded && finances.budgetLoaded}
		<div in:fade>
			<div class="flex w-full flex-row items-start gap-4 max-md:flex-col">
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					onclick={() => {
						setActivePage('budget');
						goto(resolve(urls.budget));
					}}
				>
					<div class="absolute top-[10px] bottom-[10px] left-[10px]">
						<div
							class="h-full w-1 rounded-full transition-all duration-900"
							class:bg-c-primary={colorLoaded}
						></div>
					</div>
					<div class="flex w-full flex-row items-center justify-between pl-4">
						<Heading title={ts.get.finances.budget} my={0} />
						<span class="text-xl md:text-3xl"
							>{europeanFormat(finances.getBudgetTotal())}</span
						>
					</div>
				</button>
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					class:border-c-success={colorLoaded && finances.getWealthSum() > 0}
					class:border-c-danger={colorLoaded && finances.getWealthSum() < 0}
					onclick={() => {
						setActivePage('wealth');
						goto(resolve(urls.wealth));
					}}
				>
					<div class="absolute top-[10px] bottom-[10px] left-[10px]">
						<div
							class="h-full w-1 rounded-full transition-all duration-900"
							class:bg-c-primary={colorLoaded}
						></div>
					</div>
					<div class="flex w-full flex-row items-center justify-between pl-4">
						<Heading title={ts.get.finances.wealth} my={0} />
						<span class="text-xl md:text-3xl"
							>{europeanFormat(finances.getWealthSum())}</span
						>
					</div>
				</button>
			</div>
		</div>

		<div class="flex w-full flex-row gap-4 max-md:flex-col" in:slide>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 ">
				<div class="mb-4 pl-5">
					<h2 class="text-xl">{ts.get.finances.income_vs_expenses}</h2>
				</div>
				<div class="pl-5">
					<BarChart
						categories={[ts.get.finances.income, ts.get.finances.expenses]}
						values={[finances.getBudgetIncomeTotal(), finances.getBudgetExpenseTotal()]}
					/>
				</div>
			</div>

			{#if finances.wealth.length > 0}
				<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
					<div class="mb-4 pl-5">
						<h2 class="text-xl">{ts.get.finances.wealth_distribution}</h2>
					</div>
					<div class="pl-5">
						<DoughnutChart
							values={finances.wealth.map((wealth) => ({
								value: wealth.currentValue?.value ?? 0,
								name: wealth.title
							}))}
						/>
					</div>
				</div>
			{/if}
		</div>

		{#if statistics.length > 0}
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
				in:slide
			>
				<div class="mb-4 pl-5">
					<h2 class="text-xl">{ts.get.finances.wealth_trend}</h2>
				</div>
				<div class="pl-5">
					<SmoothLineChart
						categories={statistics.map((stat) => stat.date)}
						values={getTotalSeriesData(statistics)}
						filled={true}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>
